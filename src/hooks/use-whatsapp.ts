import { useQueryClient } from "@tanstack/react-query"
import { useApiQuery, useApiMutation, useCustomUrlApiMutation } from "./backend-api-query"
import type {
  Conversation,
  Message,
  MessageTemplate,
  SendMessagePayload,
  SendTemplatePayload,
  CreateTemplatePayload,
  NewConversationPayload,
  WhatsAppStatus,
} from "@/types/whatsapp"

export const whatsappKeys = {
  all: ["whatsapp"],
  conversations: (userId: string) => [...whatsappKeys.all, "conversations", userId],
  messages: (conversationId: string) => [...whatsappKeys.all, "messages", conversationId],
  templates: (userId: string) => [...whatsappKeys.all, "templates", userId],
  status: (userId: string) => [...whatsappKeys.all, "status", userId]
}

export function useWhatsAppConversations(userId: string | undefined) {
  return useApiQuery<{ success: boolean; conversations: Conversation[] }>(
    whatsappKeys.conversations(userId || ""),
    `/whatsapp/conversations/${userId}`,
    {
      enabled: !!userId,
      staleTime: 1000 * 60, // 1 minute
    },
  )
}

export function useWhatsAppMessages(conversationId: string | undefined) {
  return useApiQuery<{ success: boolean; messages: Message[] }>(
    whatsappKeys.messages(conversationId || ""),
    `/whatsapp/conversations/${conversationId}/messages`,
    {
      enabled: !!conversationId,
      staleTime: 1000 * 10, // 10 seconds for active chat
    },
  )
}

export function useWhatsAppTemplates(userId: string | undefined) {
  return useApiQuery<{ success: boolean; templates: MessageTemplate[] }>(
    whatsappKeys.templates(userId || ""),
    `/whatsapp/templates/${userId}`,
    {
      enabled: !!userId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  )
}

export function useWhatsAppStatus(userId: string | undefined) {
  return useApiQuery<WhatsAppStatus>(
    whatsappKeys.status(userId || ""),
    `/whatsapp/status/${userId}`,
    {
      enabled: !!userId,
      staleTime: 1000 * 30, // 30 seconds
      refetchInterval: 1000 * 60, // Refetch every minute to keep status fresh
    },
  )
}

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient()

  return useApiMutation<any, SendMessagePayload>("POST", "/whatsapp/messages/send", {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: whatsappKeys.conversations(variables.userId) })
    },
  })
}

export function useSendWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useApiMutation<any, SendTemplatePayload>("POST", "/whatsapp/messages/template", {
    onSuccess: (_, variables) => {
      // We don't have conversationId here, so we invalidate all conversations for user
      queryClient.invalidateQueries({ queryKey: whatsappKeys.conversations(variables.userId) })
    },
  })
}

export function useCreateWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useApiMutation<any, CreateTemplatePayload>("POST", "/whatsapp/templates", {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.templates(variables.userId) })
    },
  })
}

export function useStartNewConversation() {
  const queryClient = useQueryClient()

  return useApiMutation<any, NewConversationPayload>("POST", "/whatsapp/messages/template", {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.conversations(variables.userId) })
    },
  })
}

export function useUpdateConversationName() {
    const queryClient = useQueryClient()

    const mutation = useCustomUrlApiMutation<any>("POST", {
        onSuccess: (_, variables) => {
            const payloadData = (variables?.data ?? {}) as { userId?: string }
            if (payloadData.userId) {
                queryClient.invalidateQueries({ queryKey: whatsappKeys.conversations(payloadData.userId) })
            }
        },
    })

    const updateConversationName = (vars: { userId: string; conversationId: string; newName: string }) =>
        mutation.mutateAsync({
            url: `/whatsapp/conversations/${vars.conversationId}/name`,
            data: { userId: vars.userId, newName: vars.newName },
        })

    return { ...mutation, updateConversationName }
}

export function useClearUnreadCount() {
    const queryClient = useQueryClient()

    const mutation = useCustomUrlApiMutation<any>("POST", {
        onSuccess: (_, variables) => {
            const payloadData = (variables?.data ?? {}) as { userId?: string }
            if (payloadData.userId) {
                queryClient.invalidateQueries({ queryKey: whatsappKeys.conversations(payloadData.userId) })
            }
        },
    })

    const clearUnreadCount = (vars: { userId: string; conversationId: string }) =>
        mutation.mutateAsync({
            url: `/whatsapp/conversations/${vars.conversationId}/clear-unread`,
            data: { userId: vars.userId },
        })

    return { ...mutation, clearUnreadCount }
}

export function useDisconnectWhatsApp() {
    const queryClient = useQueryClient()

    const mutation = useCustomUrlApiMutation<{ success: boolean; message: string }>("DELETE", {
        onSuccess: (_, variables) => {
            const payloadData = (variables?.data ?? {}) as { userId?: string }
            if (payloadData.userId) {
                queryClient.invalidateQueries({ queryKey: whatsappKeys.status(payloadData.userId) })
                queryClient.invalidateQueries({ queryKey: whatsappKeys.conversations(payloadData.userId) })
                queryClient.invalidateQueries({ queryKey: whatsappKeys.templates(payloadData.userId) })
            }
        },
    })

    const disconnectWhatsApp = (vars: { userId: string }) =>
        mutation.mutateAsync({
            url: `/whatsapp/disconnect/${vars.userId}`,
            data: { userId: vars.userId },
        })

    return { ...mutation, disconnectWhatsApp }
}
