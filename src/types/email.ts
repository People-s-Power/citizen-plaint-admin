export interface EmailMessage {
  id: string
  threadId: string
  from: EmailParticipant[]
  to: EmailParticipant[]
  cc?: EmailParticipant[]
  bcc?: EmailParticipant[]
  replyTo?: EmailParticipant[] // Added replyTo field for Nylas reply_to mapping
  subject: string
  snippet: string
  body?: string
  date: number
  unread: boolean
  starred: boolean
  folders: string[]
  labels?: string[] // Added labels field for Nylas labels mapping
  attachments?: EmailAttachment[]
}

export interface EmailParticipant {
  name?: string
  email: string
}

export interface EmailAttachment {
  id: string
  filename: string
  contentType: string
  size: number
}

export interface EmailFolder {
  id: string
  name: string
  systemFolder?: string
  totalCount?: number
  unreadCount?: number
}

export interface EmailThread {
  id: string
  subject: string
  snippet: string
  lastMessageTimestamp: number
  participants: EmailParticipant[]
  messageIds: string[]
  unread: boolean
  starred: boolean
  folders: string[]
}