import { format } from "date-fns"
import { Reply, ReplyAll, Forward, Trash2, Archive, Star, MoreHorizontal, Paperclip, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { EmailMessage } from "@/types/email"
import EmailContentIframe from "./email-content-iframe"

interface EmailViewerProps {
  message: EmailMessage | null
  onClose: () => void
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onDelete: () => void
  onArchive: () => void
  onToggleStar: () => void
}

export function EmailViewer({
  message,
  onClose,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
  onToggleStar,
}: EmailViewerProps) {
  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No message selected</p>
          <p className="text-sm">Select a message to view its contents</p>
        </div>
      </div>
    )
  }

  const senderName = message.from[0]?.name || message.from[0]?.email || "Unknown"
  const senderEmail = message.from[0]?.email || ""
  const senderInitials = senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const recipients = message.to.map((r) => r.name || r.email).join(", ")

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold truncate">{message.subject || "(No subject)"}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onToggleStar}>
              <Star className={cn("w-4 h-4", message.starred && "fill-yellow-500 text-yellow-500")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onArchive}>
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sender info */}
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">{senderInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{senderName}</span>
              <span className="text-sm text-muted-foreground">&lt;{senderEmail}&gt;</span>
            </div>
            <div className="text-sm text-muted-foreground">To: {recipients}</div>
            <div className="text-xs text-muted-foreground mt-1">{format(new Date(message.date), "PPpp")}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onReply}>
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline" size="sm" onClick={onReplyAll}>
            <ReplyAll className="w-4 h-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" onClick={onForward}>
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 p-4">
        {/* <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: message.body || message.snippet }}
        /> */}
        <EmailContentIframe html={message.body || message.snippet} />
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              {message.attachments.length} Attachment{message.attachments.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[150px]">{attachment.filename}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}