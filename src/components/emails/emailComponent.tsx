import { useState, useEffect, useMemo } from "react"
import { EmailSidebar } from "./email-sidebar"
import { EmailList } from "./email-list"
import { EmailViewer } from "./email-viewer"
import { EmailToolbar } from "./email-toolbar"
import { ConnectEmail } from "./connect-email"
import { EmailComposer, type ComposeMode } from "./email-composer"
import type { EmailMessage, EmailFolder } from "@/types/email"
import {
  useEmailFolders,
  useEmailMessages,
  useUpdateMessage,
  useBulkUpdateMessages,
  useSendEmail,
} from "@/hooks/use-email"
import { MessagingTabs } from "../messagingTab"
// import { useToast } from "@/hooks/use-toast"

interface EmailClientProps {
  grantId: string | null
  onConnectEmail: () => void
}

const mapNylasFolderToSystemFolder = (folder: any): EmailFolder => {
  const attributes = folder.attributes || []
  let systemFolder: string | undefined

  if (attributes.includes("\\Inbox") || folder.name?.toLowerCase() === "inbox") {
    systemFolder = "inbox"
  } else if (attributes.includes("\\Sent") || folder.name?.toLowerCase() === "sent") {
    systemFolder = "sent"
  } else if (attributes.includes("\\Trash") || folder.name?.toLowerCase() === "trash") {
    systemFolder = "trash"
  } else if (attributes.includes("\\Drafts") || folder.name?.toLowerCase() === "drafts") {
    systemFolder = "drafts"
  } else if (attributes.includes("\\Archive") || folder.name?.toLowerCase() === "archive") {
    systemFolder = "archive"
  } else if (
    attributes.includes("\\Junk") ||
    folder.name?.toLowerCase() === "spam" ||
    folder.name?.toLowerCase() === "junk"
  ) {
    systemFolder = "spam"
  } else if (attributes.includes("\\Flagged") || folder.name?.toLowerCase() === "starred") {
    systemFolder = "starred"
  }

  return {
    id: folder.id,
    name: folder.name || folder.id,
    systemFolder,
    totalCount: folder.totalCount || 0,
    unreadCount: folder.unreadCount || 0,
  }
}

const mapNylasMessageToEmail = (msg: any): EmailMessage => ({
  id: msg.id,
  threadId: msg.thread_id,
  from: msg.from || [],
  to: msg.to || [],
  cc: msg.cc,
  bcc: msg.bcc,
  replyTo: msg.reply_to,
  subject: msg.subject || "(No subject)",
  snippet: msg.snippet || "",
  body: msg.body || "",
  date: msg.date ? msg.date * 1000 : Date.now(), // Nylas returns Unix timestamp
  unread: msg.unread ?? false,
  starred: msg.starred ?? false,
  folders: msg.folders || [],
  labels: msg.labels,
  attachments: msg.attachments?.map((att: any) => ({
    id: att.id,
    filename: att.filename,
    contentType: att.content_type,
    size: att.size,
  })),
})

export function EmailClient({ grantId, onConnectEmail }: EmailClientProps) {
  const [activeFolder, setActiveFolder] = useState("inbox")
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>()
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeMode, setComposeMode] = useState<ComposeMode>("new")
  const [composeOriginalMessage, setComposeOriginalMessage] = useState<EmailMessage | null>(null)

//   const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: foldersResponse, isLoading: foldersLoading, refetch: refetchFolders } = useEmailFolders(grantId)

  const folders: EmailFolder[] = foldersResponse?.data
    ? [
        { id: "starred", name: "Starred", systemFolder: "starred", totalCount: 0 },
        ...foldersResponse.data.map(mapNylasFolderToSystemFolder),
      ]
    : []

  useEffect(() => {
    if (folders.length > 0 && activeFolder !== "starred") {
      const folder = folders.find((f) => f.systemFolder === activeFolder || f.id === activeFolder)
      setActiveFolderId(folder?.id)
    } else {
      setActiveFolderId(undefined)
    }
  }, [activeFolder, folders])

  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEmailMessages(grantId, activeFolderId, {
    limit: 25,
    searchQuery: debouncedSearch || undefined,
  })

  const messages: EmailMessage[] = useMemo(() => {
    if (!messagesData?.pages) return []
    return messagesData.pages.flatMap((page) => page.data?.map(mapNylasMessageToEmail) || [])
  }, [messagesData?.pages])

  const filteredMessages = activeFolder === "starred" ? messages.filter((m) => m.starred) : messages

  const updateMessage = useUpdateMessage(grantId)
  const bulkUpdate = useBulkUpdateMessages(grantId)
  const sendEmail = useSendEmail(grantId)

  const handleFolderSelect = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    if (folder?.systemFolder) {
      setActiveFolder(folder.systemFolder)
    } else {
      setActiveFolder(folderId)
    }
    setSelectedMessage(null)
    setSelectedIds([])
  }

  const handleMessageSelect = (message: EmailMessage) => {
    setSelectedMessage(message)
    if (message.unread) {
      updateMessage.mutate({
        url: `/email/messages/${message.id}?grantId=${grantId}`,
        data: { unread: false },
      })
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredMessages.map((m) => m.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleStar = (id: string) => {
    const message = messages.find((m) => m.id === id)
    if (message) {
      updateMessage.mutate({
        url: `/email/messages/${id}?grantId=${grantId}`,
        data: { starred: !message.starred },
      })
    }
  }

  const handleDelete = () => {
    const idsToDelete = selectedMessage ? [selectedMessage.id] : selectedIds
    bulkUpdate.mutate(
      {
        messageIds: idsToDelete,
        action: "delete",
      },
      {
        onSuccess: () => {
          setSelectedMessage(null)
          setSelectedIds([])
          refetchMessages()
          refetchFolders()
        },
      },
    )
  }

  const handleArchive = () => {
    const idsToArchive = selectedMessage ? [selectedMessage.id] : selectedIds
    bulkUpdate.mutate(
      {
        messageIds: idsToArchive,
        action: "archive",
      },
      {
        onSuccess: () => {
          setSelectedMessage(null)
          setSelectedIds([])
          refetchMessages()
          refetchFolders()
        },
      },
    )
  }

  const handleMarkRead = () => {
    bulkUpdate.mutate(
      {
        messageIds: selectedIds,
        action: "markRead",
      },
      {
        onSuccess: () => refetchMessages(),
      },
    )
  }

  const handleMarkUnread = () => {
    bulkUpdate.mutate(
      {
        messageIds: selectedIds,
        action: "markUnread",
      },
      {
        onSuccess: () => refetchMessages(),
      },
    )
  }

  const handleRefresh = () => {
    refetchFolders()
    refetchMessages()
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleCompose = () => {
    setComposeMode("new")
    setComposeOriginalMessage(null)
    setComposeOpen(true)
  }

  const handleReply = () => {
    setComposeMode("reply")
    setComposeOriginalMessage(selectedMessage)
    setComposeOpen(true)
  }

  const handleReplyAll = () => {
    setComposeMode("replyAll")
    setComposeOriginalMessage(selectedMessage)
    setComposeOpen(true)
  }

  const handleForward = () => {
    setComposeMode("forward")
    setComposeOriginalMessage(selectedMessage)
    setComposeOpen(true)
  }

  const handleSendEmail = async (data: {
    to: { email: string; name?: string }[]
    cc?: { email: string; name?: string }[]
    bcc?: { email: string; name?: string }[]
    subject: string
    body: string
    replyToMessageId?: string
    attachments?: File[]
  }) => {
    if (data.attachments && data.attachments.length > 0) {
      console.warn("[v0] Attachments are collected but require backend multipart support to upload to Nylas")
    }

    sendEmail.mutate(
      {
        to: data.to,
        cc: data.cc,
        bcc: data.bcc,
        subject: data.subject,
        body: data.body,
        replyToMessageId: data.replyToMessageId,
      },
      {
        onSuccess: () => {
          setComposeOpen(false)
        //   toast({
        //     title: "Email sent",
        //     description: "Your message has been sent successfully.",
        //   })
          refetchMessages()
        },
        onError: (error) => {
        //   toast({
        //     title: "Failed to send",
        //     description: error instanceof Error ? error.message : "An error occurred while sending your email.",
        //     variant: "destructive",
        //   })
        },
      },
    )
  }

  if (!grantId) {
    return <ConnectEmail onConnect={onConnectEmail} />
  }

  const isLoading = foldersLoading || messagesLoading

  return (
    <div>
        <MessagingTabs />
    <div className="flex h-[calc(100vh-140px)] border border-border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <EmailSidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderSelect={handleFolderSelect}
        onCompose={handleCompose}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <EmailToolbar
          selectedCount={selectedIds.length}
          totalCount={filteredMessages.length}
          allSelected={selectedIds.length === filteredMessages.length && filteredMessages.length > 0}
          onSelectAll={handleSelectAll}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onMarkRead={handleMarkRead}
          onMarkUnread={handleMarkUnread}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="flex-1 flex min-h-0">
          {/* Email list */}
          <div className="w-96 border-r border-border flex flex-col">
            <EmailList
              messages={filteredMessages}
              selectedMessageId={selectedMessage?.id || null}
              selectedIds={selectedIds}
              onMessageSelect={handleMessageSelect}
              onToggleSelect={handleToggleSelect}
              onToggleStar={handleToggleStar}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={handleLoadMore}
            />
          </div>

          {/* Email viewer */}
          <EmailViewer
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
            onReply={handleReply}
            onReplyAll={handleReplyAll}
            onForward={handleForward}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onToggleStar={() => selectedMessage && handleToggleStar(selectedMessage.id)}
          />
        </div>
      </div>

      {/* Compose Dialog */}
      <EmailComposer
        open={composeOpen}
        onOpenChange={setComposeOpen}
        mode={composeMode}
        originalMessage={composeOriginalMessage}
        onSend={handleSendEmail}
        isSending={sendEmail.isPending}
      />
    </div>
    </div>
  )
}
