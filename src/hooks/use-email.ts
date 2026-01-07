import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { useApiQuery, useApiMutation, useCustomUrlApiMutation } from "./api"
import type { EmailMessage, EmailFolder } from "@/types/email"

export const emailKeys = {
  all: ["email"] as const,
  folders: (grantId: string) => [...emailKeys.all, "folders", grantId] as const,
  messages: (grantId: string, folderId?: string, searchQuery?: string) =>
    [...emailKeys.all, "messages", grantId, folderId, searchQuery] as const,
  message: (grantId: string, messageId: string) => [...emailKeys.all, "message", grantId, messageId] as const,
  threads: (grantId: string) => [...emailKeys.all, "threads", grantId] as const,
}

export function useEmailFolders(grantId: string | null) {
  return useApiQuery<{ data: EmailFolder[] }>(
    emailKeys.folders(grantId || "") as unknown as string[],
    `/email/folders?grantId=${grantId}`,
    {
      enabled: !!grantId,
      staleTime: 1000 * 60 * 5,
    },
  )
}

interface MessagesResponse {
  data: any[]
  nextCursor: string | null
}

export function useEmailMessages(
  grantId: string | null,
  folderId?: string,
  options?: { limit?: number; searchQuery?: string },
) {
  const buildUrl = (pageToken?: string) => {
    const params = new URLSearchParams()
    if (grantId) params.append("grantId", grantId)
    if (folderId) params.append("folderId", folderId)
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.searchQuery) params.append("searchQuery", options.searchQuery)
    if (pageToken) params.append("pageToken", pageToken)
    return `/api/email/messages?${params.toString()}`
  }

  return useInfiniteQuery<MessagesResponse>({
    queryKey: emailKeys.messages(grantId || "", folderId, options?.searchQuery) as unknown as string[],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(buildUrl(pageParam as string | undefined), {
        headers: {
          "Content-Type": "application/json",
          "x-grant-id": grantId || "",
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }
      return response.json()
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!grantId,
    staleTime: 1000 * 60,
  })
}

export function useEmailMessage(grantId: string | null, messageId: string | null) {
  return useApiQuery<{ data: EmailMessage }>(
    emailKeys.message(grantId || "", messageId || "") as unknown as string[],
    `/email/messages/${messageId}?grantId=${grantId}`,
    {
      enabled: !!grantId && !!messageId,
    },
  )
}

export function useUpdateMessage(grantId: string | null) {
  const queryClient = useQueryClient()

  return useCustomUrlApiMutation<{ data: EmailMessage }>("PUT", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.messages(grantId || "") })
    },
  })
}

export function useDeleteMessage(grantId: string | null) {
  const queryClient = useQueryClient()

  return useCustomUrlApiMutation<{ success: boolean }>("DELETE", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.messages(grantId || "") })
      queryClient.invalidateQueries({ queryKey: emailKeys.folders(grantId || "") })
    },
  })
}

interface SendEmailPayload {
  to: Array<{ email: string; name?: string }>
  cc?: Array<{ email: string; name?: string }>
  bcc?: Array<{ email: string; name?: string }>
  subject: string
  body: string
  replyToMessageId?: string
}

export function useSendEmail(grantId: string | null) {
  const queryClient = useQueryClient()

  return useApiMutation<{ data: EmailMessage }, SendEmailPayload>("POST", `/email/send?grantId=${grantId}`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.messages(grantId || "", "sent") })
    },
  })
}

interface BulkUpdatePayload {
  messageIds: string[]
  action: "archive" | "delete" | "markRead" | "markUnread" | "star" | "unstar"
}

export function useBulkUpdateMessages(grantId: string | null) {
  const queryClient = useQueryClient()

  return useApiMutation<{ success: boolean }, BulkUpdatePayload>("POST", `/email/messages/bulk?grantId=${grantId}`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.messages(grantId || "") })
      queryClient.invalidateQueries({ queryKey: emailKeys.folders(grantId || "") })
    },
  })
}