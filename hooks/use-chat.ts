"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import type { Conversation, Message } from "@/lib/types"
import { toast } from "sonner"

export function useChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(false)

  // Crear u obtener conversación por colaboración
  const ensureConversation = useCallback(async (params: {
    collaborationId: string
    projectId: string
    ownerId: string
    collaboratorId: string
  }) => {
    const { collaborationId, projectId, ownerId, collaboratorId } = params
    try {
      setLoading(true)

      const { data: existing, error: selError } = await supabase
        .from("conversations")
        .select("*")
        .eq("collaboration_id", collaborationId)
        .maybeSingle()

      if (selError) throw selError

      if (existing) {
        setConversation(existing)
        return existing
      }

      // Insertar conversación (por defecto solo el owner puede crear según RLS)
      const { data: inserted, error: insError } = await supabase
        .from("conversations")
        .insert({
          collaboration_id: collaborationId,
          project_id: projectId,
          owner_id: ownerId,
          collaborator_id: collaboratorId,
          is_open: true
        })
        .select("*")
        .single()

      if (insError) throw insError

      setConversation(inserted)
      return inserted
    } catch (err: any) {
      console.error("ensureConversation error:", err)
      toast.error(err.message || "Error creando conversación")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err: any) {
      console.error("loadMessages error:", err)
      toast.error(err.message || "Error al cargar mensajes")
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión")
      return { success: false }
    }
    if (!content.trim()) return { success: false }

    try {
      // Insert con retorno del registro para actualización optimista
      const { data: inserted, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        })
        .select("*")
        .single()

      if (error) throw error

      // Optimista: añadir al estado si no existe
      setMessages((prev) => {
        if (prev.some((m) => m.id === inserted.id)) return prev
        return [...prev, inserted]
      })

      // Actualizar last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", conversationId)

      return { success: true }
    } catch (err: any) {
      console.error("sendMessage error:", err)
      toast.error(err.message || "Error al enviar mensaje")
      return { success: false }
    }
  }, [user])

  // Suscripción en tiempo real a nuevos mensajes de la conversación (con deduplicación)
  useEffect(() => {
    if (!conversation?.id) return

    const channel = supabase
      .channel(`realtime-messages-${conversation.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversation.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation?.id])

  // Polling de respaldo por si Realtime no está habilitado (cada 3s)
  useEffect(() => {
    if (!conversation?.id) return
    const interval = setInterval(() => {
      loadMessages(conversation.id!)
    }, 3000)
    return () => clearInterval(interval)
  }, [conversation?.id, loadMessages])

  return {
    conversation,
    messages,
    loading,
    ensureConversation,
    loadMessages,
    sendMessage,
    setConversation,
    setMessages,
  }
}