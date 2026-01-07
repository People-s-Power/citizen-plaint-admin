// WhatsApp domain types matching backend schemas

export interface Conversation {
  id: string
  userId: string
  customerPhone: string
  customerName: string | null
  lastMessageText: string
  lastMessageAt: string
  unreadCount: number
  status: "active" | "archived" | "closed"
  metadata: {
    customerProfilePicUrl?: string
    tags?: string[]
    assignedTo?: string
    notes?: string
  }
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  userId: string
  twilioMessageSid: string
  direction: "inbound" | "outbound"
  from: string
  to: string
  body: string
  mediaUrls: string[]
  mediaContentTypes: string[]
  status: "queued" | "sending" | "sent" | "delivered" | "read" | "failed" | "undelivered"
  errorCode: string | null
  errorMessage: string | null
  timestamp: string
  deliveredAt: string | null
  readAt: string | null
  metadata: {
    twilioAccountSid?: string
    twilioSubaccountSid?: string
    priceAmount?: string
    priceCurrency?: string
    numSegments?: number
    numMedia?: number
  }
  createdAt: string
  updatedAt: string
}

export interface MessageTemplate {
  id: string
  userId: string
  name: string
  content: string
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION"
  language: string
  variables: Array<{
    key: string
    name: string
    example: string
  }>
  status: "pending" | "approved" | "rejected" | "paused" | "received"
  twilioContentSid: string | null
  metaTemplateId: string | null
  isDefault: boolean
  rejectionReason: string | null
  approvedAt: string | null
  lastUsedAt: string | null
  usageCount: number
  components: {
    headerType?: string
    headerText?: string
    headerMediaUrl?: string
    footerText?: string
    buttons?: Array<{
      type: string
      text: string
      url?: string
      phoneNumber?: string
    }>
  }
  createdAt: string
  updatedAt: string
}

export interface SendMessagePayload {
  userId: string
  conversationId: string
  body: string
  mediaUrls?: string[]
}

export interface SendTemplatePayload {
  userId: string
  customerPhone: string
  templateId: string
  variableValues?: Record<string, string>
}

export interface CreateTemplatePayload {
  userId: string
  name: string
  content: string
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION"
  language?: string
  variables?: Array<{ key: string; name: string; example: string }>
  isDefault?: boolean
}

export interface CreateConversationPayload {
  userId: string
  customerPhone: string
  templateId: string
  variableValues?: Record<string, string>
}

export interface NewConversationPayload extends SendTemplatePayload {
  customerName?: string
}

export interface WhatsAppStatus {
  connected: boolean
  status?: 'CREATING' | 'ONLINE' | 'OFFLINE' | 'PAUSED' | 'DELETED'
  statusMessage?: string
  message?: string
  sender?: {
    sid: string
    senderId: string
    status: string
    configuration: any
    profile: any
  }
  user: {
    whatsappNumber: string | null
    whatsappDisplayName: string | null
    whatsappWabaId?: string | null
  }
  statistics?: {
    totalConversations: number
    unreadMessages: number
  }
  checkedAt?: string
}
