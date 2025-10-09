import { useCallback, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./use-auth"

export function useUnreadCounts(pollMs: number = 5000) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [lastStableCount, setLastStableCount] = useState(0)

  const loadUnread = useCallback(async () => {
    try {
      if (!user?.id) {
        setUnreadCount(0)
        setLastStableCount(0)
        return
      }
      setIsFetching(true)

      const { data, error } = await supabase.rpc("unread_message_count", {
        p_user_id: user.id,
      })
      if (error) throw error

      const next = typeof data === "number" ? data : 0
      setUnreadCount(next)
      setLastStableCount(next)
    } catch (err) {
      console.error("Error cargando conteo no leídos (RPC):", err)
      setUnreadCount(lastStableCount)
    } finally {
      setIsFetching(false)
    }  
  }, [user?.id, lastStableCount])

  useEffect(() => {
    loadUnread()
    if (!user?.id) return
    const interval = setInterval(loadUnread, pollMs)
    return () => clearInterval(interval)
  }, [loadUnread, pollMs, user?.id])

  return { unreadCount: lastStableCount, isFetching, refresh: loadUnread }
}