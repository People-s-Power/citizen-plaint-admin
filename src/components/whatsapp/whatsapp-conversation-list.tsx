"use client"

import { useState } from "react"
import { useWhatsAppConversations } from "@/hooks/use-whatsapp"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, User, MessageSquare, Loader2, FileText, PlusCircle } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/types/whatsapp"

interface WhatsappConversationListProps {
  userId: string
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
  onViewTemplates: () => void
  onStartNewChat: () => void
}

export function WhatsappConversationList({
  userId,
  selectedConversationId,
  onSelectConversation,
  onViewTemplates,
  onStartNewChat,
}: WhatsappConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { data, isLoading } = useWhatsAppConversations(userId)

  const conversations = data?.conversations || []
  const filteredConversations = conversations.filter(
    (c) =>
      c.customerPhone.includes(searchQuery) ||
      (c.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatLastMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return format(date, "HH:mm")
    if (isYesterday(date)) return "Yesterday"
    return format(date, "dd/MM/yy")
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r">
      <div className="p-4 border-b">
        <div className="flex flex-col  gap-y-3 mb-4">
          <h2 className="text-xl font-bold">WhatsApp</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onViewTemplates} className="h-8 px-2 bg-transparent">
              <FileText className="h-3.5 w-3.5" />
              <span className="ml-1.5 hidden md:inline">Templates</span>
            </Button>
            <Button size="sm" onClick={onStartNewChat} className="h-8 px-2 text-white">
              <PlusCircle className="h-3.5 w-3.5 text-white" color="white" />
              <span className="ml-1.5 hidden md:inline text-white">New Chat</span>
            </Button>
          </div>
        </div>
        <div className="relative">
          {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> */}
          <Input
            placeholder="Search chats..."
            className="pl-16 bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground">No conversations found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 transition-colors text-left",
                  selectedConversationId === conversation.id ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-muted/50",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={conversation.metadata.customerProfilePicUrl || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {conversation.customerName || conversation.customerPhone}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatLastMessageDate(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{conversation.lastMessageText}</p>
                  <div className="flex gap-1">
                    {conversation.metadata.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[9px] px-1 h-3 font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
