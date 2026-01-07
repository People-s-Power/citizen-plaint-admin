import { useEffect, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"
import { whatsappKeys } from "./use-whatsapp"
import type { Message } from "@/types/whatsapp"

interface NewMessagePayload {
  userId: string
  conversationId: string
  message: Message
}

export function useWhatsAppSocket(userId: string | undefined, enabled: boolean = true) {
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()

  const handleNewMessage = useCallback(
    (payload: NewMessagePayload) => {
      console.log("New WhatsApp message received:", payload)

      queryClient.invalidateQueries({
        queryKey: whatsappKeys.messages(payload.conversationId),
      })

      queryClient.invalidateQueries({
        queryKey: whatsappKeys.conversations(payload.userId),
      })

    },
    [queryClient],
  )

  useEffect(() => {
    if (!enabled || !userId) {
      return
    }

    if (socketRef.current?.connected) {
      return
    }

    console.log("Connecting to WhatsApp WebSocket...")

    const socket = io("/whatsapp", {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log(" WhatsApp WebSocket connected")
    })

    socket.on("disconnect", (reason) => {
      console.log(" WhatsApp WebSocket disconnected:", reason)
    })

    socket.on("connect_error", (error) => {
      console.error(" WhatsApp WebSocket connection error:", error)
    })

    socket.on("new_whatsapp_message", handleNewMessage)

    return () => {
      console.log(" Disconnecting WhatsApp WebSocket...")
      socket.off("new_whatsapp_message", handleNewMessage)
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId, enabled, handleNewMessage])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  }
}
