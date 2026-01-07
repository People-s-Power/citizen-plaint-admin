import { useEffect, useState, useCallback } from "react"
import { useEditor, EditorContent, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Paperclip,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { EmailMessage, EmailParticipant } from "@/types/email"
import { is } from "date-fns/locale"

export type ComposeMode = "new" | "reply" | "replyAll" | "forward"

interface EmailComposerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ComposeMode
  originalMessage?: EmailMessage | null
  onSend: (data: {
    to: EmailParticipant[]
    cc?: EmailParticipant[]
    bcc?: EmailParticipant[]
    subject: string
    body: string
    replyToMessageId?: string
    attachments?: File[]
  }) => void
  isSending?: boolean
}

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB limit per attachment
const MAX_TOTAL_SIZE = 25 * 1024 * 1024 // 25MB total limit

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseEmailInput(input: string): EmailParticipant[] {
  return input
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0)
    .map((email) => {
      // Handle "Name <email@example.com>" format
      const match = email.match(/^(.+?)\s*<(.+?)>$/)
      if (match) {
        return { name: match[1].trim(), email: match[2].trim() }
      }
      return { email }
    })
}

function formatRecipients(participants: EmailParticipant[]): string {
  return participants.map((p) => (p.name ? `${p.name} <${p.email}>` : p.email)).join(", ")
}

export function EmailComposer({
  open,
  onOpenChange,
  mode,
  originalMessage,
  onSend,
  isSending = false,
}: EmailComposerProps) {
  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [subject, setSubject] = useState("")
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Write your message here...",
      }),
    ],
    immediatelyRender: false,
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-3",
      },
    },
  })

  const editorState = useEditorState({
    editor,

    // the selector function is used to select the state you want to react to
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        isEditable: editor.isEditable,
        currentSelection: editor.state.selection,
        currentContent: editor.getJSON(),
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isUnderline: editor.isActive('underline'),
        isStrike: editor.isActive('strike'),
        isBulletList: editor.isActive('bulletList'),
        isOrderedList: editor.isActive('orderedList'),
        textAlign: editor.getAttributes('textAlign').align || 'left',
      };
    },
  });

  // Reset form when dialog opens or mode changes
  useEffect(() => {
    if (!open) return

    setAttachments([])
    setAttachmentError(null)

    if (mode === "new" || !originalMessage) {
      setTo("")
      setCc("")
      setBcc("")
      setSubject("")
      setShowCcBcc(false)
      editor?.commands.setContent("")
      return
    }

    const sender = originalMessage.from[0]
    const originalRecipients = originalMessage.to || []
    const originalCc = originalMessage.cc || []

    switch (mode) {
      case "reply":
        // Reply to sender only
        setTo(formatRecipients(originalMessage.replyTo || [sender]))
        setCc("")
        setBcc("")
        setSubject(
          originalMessage.subject.startsWith("Re:") ? originalMessage.subject : `Re: ${originalMessage.subject}`,
        )
        setShowCcBcc(false)
        break

      case "replyAll":
        // Reply to sender + all recipients (excluding current user)
        setTo(formatRecipients(originalMessage.replyTo || [sender]))
        setCc(formatRecipients([...originalRecipients, ...originalCc]))
        setBcc("")
        setSubject(
          originalMessage.subject.startsWith("Re:") ? originalMessage.subject : `Re: ${originalMessage.subject}`,
        )
        setShowCcBcc(originalCc.length > 0)
        break

      case "forward":
        setTo("")
        setCc("")
        setBcc("")
        setSubject(
          originalMessage.subject.startsWith("Fwd:") ? originalMessage.subject : `Fwd: ${originalMessage.subject}`,
        )
        setShowCcBcc(false)
        break
    }

    // Set quoted content for reply/forward
    if (originalMessage) {
      const quotedHeader = `<br><br><p>---</p><p>On ${new Date(originalMessage.date).toLocaleString()}, ${sender?.name || sender?.email} wrote:</p>`
      const quotedBody = originalMessage.body || `<p>${originalMessage.snippet}</p>`

      if (mode === "forward") {
        const forwardHeader = `<br><br><p>---------- Forwarded message ---------</p>
          <p>From: ${formatRecipients(originalMessage.from)}</p>
          <p>Date: ${new Date(originalMessage.date).toLocaleString()}</p>
          <p>Subject: ${originalMessage.subject}</p>
          <p>To: ${formatRecipients(originalMessage.to)}</p>
          ${originalMessage.cc?.length ? `<p>Cc: ${formatRecipients(originalMessage.cc)}</p>` : ""}
          <br>`
        editor?.commands.setContent(`<p></p>${forwardHeader}${quotedBody}`)
      } else {
        editor?.commands.setContent(`<p></p>${quotedHeader}<blockquote>${quotedBody}</blockquote>`)
      }
    }
  }, [open, mode, originalMessage, editor])

  const handleAddAttachment = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])

      // Check individual file sizes
      const oversizedFiles = files.filter((f) => f.size > MAX_ATTACHMENT_SIZE)
      if (oversizedFiles.length > 0) {
        setAttachmentError(`Files over 10MB: ${oversizedFiles.map((f) => f.name).join(", ")}`)
        return
      }

      // Check total size
      const currentTotal = attachments.reduce((sum, f) => sum + f.size, 0)
      const newTotal = files.reduce((sum, f) => sum + f.size, 0)
      if (currentTotal + newTotal > MAX_TOTAL_SIZE) {
        setAttachmentError("Total attachment size cannot exceed 25MB")
        return
      }

      setAttachmentError(null)
      setAttachments((prev) => [...prev, ...files])
    }
    input.click()
  }, [attachments])

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
    setAttachmentError(null)
  }

  const handleSend = () => {
    const toRecipients = parseEmailInput(to)
    if (toRecipients.length === 0) return

    onSend({
      to: toRecipients,
      cc: cc ? parseEmailInput(cc) : undefined,
      bcc: bcc ? parseEmailInput(bcc) : undefined,
      subject,
      body: editor?.getHTML() || "",
      replyToMessageId: mode !== "new" && mode !== "forward" ? originalMessage?.id : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    })
  }

  const getTitle = () => {
    switch (mode) {
      case "reply":
        return "Reply"
      case "replyAll":
        return "Reply All"
      case "forward":
        return "Forward"
      default:
        return "New Message"
    }
  }

  const totalAttachmentSize = attachments.reduce((sum, f) => sum + f.size, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Recipients */}
          <div className="px-4 py-2 space-y-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Label htmlFor="to" className="w-12 text-sm text-muted-foreground">
                To
              </Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-muted-foreground text-xs"
              >
                Cc/Bcc
                {showCcBcc ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </Button>
            </div>

            {showCcBcc && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="cc" className="w-12 text-sm text-muted-foreground">
                    Cc
                  </Label>
                  <Input
                    id="cc"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="cc@example.com"
                    className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bcc" className="w-12 text-sm text-muted-foreground">
                    Bcc
                  </Label>
                  <Input
                    id="bcc"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="bcc@example.com"
                    className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <Label htmlFor="subject" className="w-12 text-sm text-muted-foreground">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0"
              />
            </div>
          </div>

          {/* TipTap Toolbar */}
          <TooltipProvider delayDuration={300}>
            <div className="px-4 py-2 border-b border-border flex flex-wrap items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editorState?.isBold || false}
                    className={editorState?.isBold ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().toggleBold().run()}
                  >
                    <Bold className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editorState?.isItalic || false}
                        className={editorState?.isItalic ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editorState?.isUnderline || false}
                    className={editorState?.isUnderline ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().toggleUnderline().run()}
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Underline</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editorState?.isStrike || false}
                    className={editorState?.isStrike ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
                  >
                    <Strikethrough className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Strikethrough</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editorState?.isBulletList || false}
                    className={editorState?.isBulletList ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
                  >
                    <List className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editorState?.isOrderedList || false}
                    className={editorState?.isOrderedList ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive({ textAlign: "left" })}
                    className={editorState?.textAlign === "left" ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().setTextAlign("left").run()}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive({ textAlign: "center" })}
                    className={editorState?.textAlign === "center" ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().setTextAlign("center").run()}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive({ textAlign: "right" })}
                    className={editorState?.textAlign === "right" ? "bg-primary text-primary-foreground" : ""}
                    onPressedChange={() => editor?.chain().focus().setTextAlign("right").run()}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("link")}
                    onPressedChange={() => {
                      const url = window.prompt("Enter URL")
                      if (url) {
                        editor?.chain().focus().setLink({ href: url }).run()
                      } else {
                        editor?.chain().focus().unsetLink().run()
                      }
                    }}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Add Link</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Editor Content */}
          <div className="min-h-[250px]">
            <EditorContent editor={editor} />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attachments ({attachments.length})</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(totalAttachmentSize)} / {formatFileSize(MAX_TOTAL_SIZE)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm"
                  >
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {attachmentError && <p className="text-sm text-destructive mt-2">{attachmentError}</p>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleAddAttachment}>
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Attachment (max 10MB per file)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleSend} disabled={!to.trim() || isSending} className="text-black">
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
