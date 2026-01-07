"use client"

import { useState } from "react"
import { WhatsappConversationList } from "./whatsapp-conversation-list"
import { WhatsappChatView } from "./whatsapp-chat-view"
import { WhatsappTemplateManagement } from "./whatsapp-template-management"
import { WhatsappNewChat } from "./whatsapp-new-chat"
import { WhatsAppStatusHeader } from "./whatsapp-status-header"
import { MessageSquare, PhoneCall, FileText } from "lucide-react"
import type { Conversation } from "@/types/whatsapp"
import { MessagingTabs } from "../messagingTab"
import { useWhatsAppSocket } from "@/hooks/use-whatsapp-socket"

export type ViewMode = "conversations" | "templates" | "new-chat"

interface WhatsappMessageComponentProps {
    ownerId: string; // The ID of the person who owns the WhatsApp account
    orgName?: string;
}

export default function WhatsappMessageComponent({ ownerId, orgName }: WhatsappMessageComponentProps) {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>("conversations")

    // Socket connects using the owner's ID to receive their specific messages
    const { isConnected } = useWhatsAppSocket(ownerId, !!ownerId)

    const handleViewChange = (mode: ViewMode) => {
        setViewMode(mode)
        setSelectedConversation(null)
    }

    const handleChatStarted = () => {
        setViewMode("conversations")
    }

    return (
        <div>
            <MessagingTabs />
            <div className="flex flex-col h-[calc(100vh-165px)] w-full overflow-hidden bg-background">
                {/* Header now reflects the status of the linked owner */}
                <WhatsAppStatusHeader userId={ownerId} />

                <div className="flex flex-1 overflow-hidden">
                    {viewMode === "conversations" && (
                        <div className="w-full sm:w-[350px] md:w-[400px] shrink-0 h-full border-r">
                            <WhatsappConversationList
                                userId={ownerId}
                                selectedConversationId={selectedConversation?.id}
                                onSelectConversation={setSelectedConversation}
                                onViewTemplates={() => handleViewChange("templates")}
                                onStartNewChat={() => handleViewChange("new-chat")}
                            />
                        </div>
                    )}

                    <div className="flex-1 h-full relative overflow-hidden">
                        {viewMode === "templates" && (
                            <div className="h-full flex flex-col">
                                <WhatsappTemplateManagement userId={ownerId} />
                                <button
                                    onClick={() => handleViewChange("conversations")}
                                    className="sm:hidden fixed bottom-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg font-medium text-sm"
                                >
                                    ← Back to Chats
                                </button>
                            </div>
                        )}

                        {viewMode === "new-chat" && (
                            <div className="h-full flex flex-col">
                                <WhatsappNewChat userId={ownerId} onChatStarted={handleChatStarted} />
                                <button
                                    onClick={() => handleViewChange("conversations")}
                                    className="sm:hidden fixed bottom-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg font-medium text-sm"
                                >
                                    ← Back to Chats
                                </button>
                            </div>
                        )}

                        {viewMode === "conversations" && (
                            <div className="h-full">
                                {selectedConversation ? (
                                    <WhatsappChatView userId={ownerId} conversation={selectedConversation} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <div className="bg-primary/5 dark:bg-zinc-800 p-8 rounded-full mb-6">
                                            <MessageSquare className="h-16 w-16 text-primary opacity-20" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">
                                            {orgName ? `${orgName} WhatsApp` : "Your WhatsApp Messages"}
                                        </h2>
                                        <p className="text-muted-foreground max-w-md mx-auto">
                                            Select a conversation to manage messages for {orgName || "your account"}.
                                        </p>
                                        {/* ... (rest of the decorative UI) ... */}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}