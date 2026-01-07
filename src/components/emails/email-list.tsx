import { formatDistanceToNow } from "date-fns"
import { Star, Paperclip, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { EmailMessage } from "@/types/email"

interface EmailListProps {
  messages: EmailMessage[]
  selectedMessageId: string | null
  selectedIds: string[]
  onMessageSelect: (message: EmailMessage) => void
  onToggleSelect: (id: string) => void
  onToggleStar: (id: string) => void
  isLoading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

export function EmailList({
  messages,
  selectedMessageId,
  selectedIds,
  onMessageSelect,
  onToggleSelect,
  onToggleStar,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: EmailListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No messages</p>
          <p className="text-sm">This folder is empty</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-border">
        {messages.map((message) => {
          const isSelected = selectedMessageId === message.id
          const isChecked = selectedIds.includes(message.id)
          const senderName = message.from[0]?.name || message.from[0]?.email || "Unknown"

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                isSelected ? "bg-primary/5" : "hover:bg-muted/50",
                message.unread && "bg-primary/[0.02]",
              )}
              onClick={() => onMessageSelect(message)}
            >
              <div className="flex items-center gap-2 pt-0.5">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => onToggleSelect(message.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStar(message.id)
                  }}
                  className="text-muted-foreground hover:text-yellow-500"
                >
                  <Star className={cn("w-4 h-4", message.starred && "fill-yellow-500 text-yellow-500")} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "font-medium text-sm truncate",
                      message.unread ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {senderName}
                  </span>
                  {message.attachments && message.attachments.length > 0 && (
                    <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                    {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm truncate text-wrap",
                    message.unread ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {message.subject || "(No subject)"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5 text-wrap">{message.snippet}</p>
              </div>
            </div>
          )
        })}

        {hasNextPage && (
          <div className="p-4 flex justify-start">
            <Button variant="outline" size="sm" className="bg-primary-new" onClick={onLoadMore} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}