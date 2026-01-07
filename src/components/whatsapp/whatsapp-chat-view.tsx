"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useWhatsAppMessages, useSendWhatsAppMessage, useUpdateConversationName, useClearUnreadCount } from "@/hooks/use-whatsapp"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, FileText, Loader2, Phone, User, Clock, AlertCircle, Check, X } from "lucide-react"
import { format } from "date-fns"
import { WhatsappTemplateSelector } from "./whatsapp-template-selector"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/types/whatsapp"
import { toast } from "sonner"

interface WhatsappChatViewProps {
  userId: string
  conversation: Conversation
}

export function WhatsappChatView({ userId, conversation }: WhatsappChatViewProps) {
  const { data, isLoading } = useWhatsAppMessages(conversation.id)
  const sendMessage = useSendWhatsAppMessage()
  const updateName = useUpdateConversationName()
  const [inputText, setInputText] = useState("")
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const clearUnread = useClearUnreadCount()
  const [newName, setNewName] = useState(conversation.customerName)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = data?.messages || []

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight

        if (conversation.unreadCount > 0 && !clearUnread.isPending) {
          clearUnread.clearUnreadCount({
            userId,
            conversationId: conversation.id,
          })
        }
      }
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || sendMessage.isPending) return

    try {
      await sendMessage.mutateAsync({
        userId,
        conversationId: conversation.id,
        body: inputText,
      })
      setInputText("")
    } catch (error: any) {
      // Check if it's the 24-hour window error
    if (error?.message?.includes("24-hour window") || error?.status === 400) {
      toast.error("Message Failed", {
        description: "Outside 24-hour window. Please use a template message.",
        action: (
        <Button variant="outline" size="sm" onClick={() => setTemplateSelectorOpen(true)}>
          Use Template
        </Button>
        ),
      })
    } else {
      toast.error("Error", {
        description: error?.message || "Failed to send message",
      })
    }
    }
  }

  const handleUpdateName = async () => {
    if (!newName.trim() || updateName.isPending) return

    try {
      await updateName.updateConversationName({
        userId,
        conversationId: conversation.id,
        newName: newName.trim(),
      })
      setIsEditingName(false)
    toast.success("Success", {
      description: "Contact name updated successfully",
    })
    } catch (error: any) {
    toast.error("Error", {
      description: error?.message || "Failed to update name",
    })
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b shadow-sm z-10">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={conversation.metadata.customerProfilePicUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[300px]">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 text-sm py-0"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateName()
                    if (e.key === "Escape") setIsEditingName(false)
                  }}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleUpdateName}>
                  {updateName.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setIsEditingName(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {conversation.customerName || conversation.customerPhone}
                </h3>
                {!conversation.customerName && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-[10px] gap-1"
                    onClick={() => {
                    //   setNewName(conversation.customerPhone)
                      setIsEditingName(true)
                    }}
                  >
                    <User className="h-3 w-3" />
                    Save Contact
                  </Button>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{conversation.customerPhone}</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-1 font-normal capitalize">
                {conversation.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTemplateSelectorOpen(true)} className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Use Template</span>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <div className="bg-white/50 dark:bg-zinc-800/50 p-4 rounded-full mb-4">
                <Send className="h-8 w-8 opacity-20" />
              </div>
              <p>No messages yet. Send a template message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex w-full mb-2", msg.direction === "outbound" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-lg shadow-sm text-sm relative",
                    msg.direction === "outbound"
                      ? "bg-[#dcf8c6] dark:bg-emerald-900/40 text-foreground rounded-tr-none"
                      : "bg-white dark:bg-zinc-800 text-foreground rounded-tl-none",
                  )}
                >
                  <p className="whitespace-pre-wrap pb-4">{msg.body}</p>
                  <div className="absolute bottom-1 right-2 flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground/70">
                      {format(new Date(msg.timestamp), "HH:mm")}
                    </span>
                    {msg.direction === "outbound" && (
                      <span className="text-[10px]">
                        {msg.status === "read" && <span className="text-blue-500">✓✓</span>}
                        {msg.status === "delivered" && <span className="text-muted-foreground">✓✓</span>}
                        {msg.status === "sent" && <span className="text-muted-foreground">✓</span>}
                        {msg.status === "failed" && <AlertCircle className="h-3 w-3 text-destructive" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t z-10">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-muted/50 focus-visible:ring-primary"
              disabled={sendMessage.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputText.trim() || sendMessage.isPending}
              className="rounded-full shrink-0"
            >
              {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" color="gray" />}
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            Standard messages are only allowed within 24 hours of the customer's last message.
          </p>
        </div>
      </div>

      <WhatsappTemplateSelector
        userId={userId}
        customerPhone={conversation.customerPhone}
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
      />
    </div>
  )
}
