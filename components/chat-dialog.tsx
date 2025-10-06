"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "@/hooks/use-chat"
import { useAuth } from "@/hooks/use-auth"
import type { Collaboration } from "@/lib/types"
import { supabase } from "@/lib/supabase"

interface ChatDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  collaboration: Collaboration | null
}

export function ChatDialog({ open, onOpenChange, collaboration }: ChatDialogProps) {
  const { user } = useAuth()
  // Nombre de la persona con la que chateas
  const counterpartName = (() => {
    const c: any = collaboration
    if (!c) return 'Chat de Colaboración'
    const ownerId = c.projects?.created_by
    // Si soy dueño, muestro colaborador; si soy colaborador, muestro dueño del proyecto
    if (user?.id === ownerId) {
      return c?.collaborator?.full_name || c?.collaborator?.email || 'Colaborador'
    } else {
      return c?.projects?.owner?.full_name || c?.projects?.owner?.email || 'Propietario'
    }
  })()
  const { ensureConversation, conversation, loadMessages, messages, sendMessage, setConversation } = useChat()
  const [input, setInput] = useState("")

  useEffect(() => {
    if (!open || !collaboration) return

    const projectId = collaboration.project_id
    const ownerId = collaboration.projects?.created_by || ""
    const collaboratorId = collaboration.collaborator_id

    ensureConversation({
      collaborationId: collaboration.id,
      projectId,
      ownerId,
      collaboratorId
    }).then((conv) => {
      if (conv?.id) loadMessages(conv.id)
    })
  }, [open, collaboration, ensureConversation, loadMessages])

  useEffect(() => {
    if (!open) {
      setConversation(null)
      setInput("")
    }
  }, [open, setConversation])

  // Marcar como leídos cuando se abre y hay conversación
  useEffect(() => {
    const markRead = async () => {
      if (!conversation?.id || !user) return
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user.id)
        .is('read_at', null)
    }
    markRead()
  }, [conversation?.id, user?.id])

  const handleSend = async () => {
    if (!conversation?.id) return
    const ok = await sendMessage(conversation.id, input)
    if (ok.success) setInput("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{counterpartName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="border rounded-md p-3 h-64 overflow-y-auto space-y-2 bg-muted/30">
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay mensajes aún.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`text-sm max-w-[80%] p-2 rounded-md ${
                    m.sender_id === user?.id ? "bg-primary/10 ml-auto" : "bg-secondary/50"
                  }`}
                >
                  {m.content}
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(m.created_at).toLocaleString("es-ES")}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button onClick={handleSend}>Enviar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}