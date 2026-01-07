import type React from "react"
import { useState } from "react"
import {
  Inbox,
  Send,
  Trash2,
  Star,
  Archive,
  FileText,
  AlertCircle,
  FolderOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { EmailFolder } from "@/types/email"

interface EmailSidebarProps {
  folders: EmailFolder[]
  activeFolder: string
  onFolderSelect: (folderId: string) => void
  onCompose: () => void
  isLoading?: boolean
}

const systemFolderIcons: Record<string, React.ElementType> = {
  inbox: Inbox,
  sent: Send,
  trash: Trash2,
  starred: Star,
  archive: Archive,
  drafts: FileText,
  spam: AlertCircle,
}

const systemFolderOrder = ["inbox", "starred", "sent", "drafts", "archive", "spam", "trash"]

export function EmailSidebar({ folders, activeFolder, onFolderSelect, onCompose, isLoading }: EmailSidebarProps) {
  const [showAllFolders, setShowAllFolders] = useState(false)

  // Separate system folders from custom folders
  const systemFolders = folders
    .filter((f) => f.systemFolder)
    .sort((a, b) => {
      const aIndex = systemFolderOrder.indexOf(a.systemFolder?.toLowerCase() || "")
      const bIndex = systemFolderOrder.indexOf(b.systemFolder?.toLowerCase() || "")
      return aIndex - bIndex
    })

  const customFolders = folders.filter((f) => !f.systemFolder)

  const renderFolderItem = (folder: EmailFolder) => {
    const Icon = folder.systemFolder ? systemFolderIcons[folder.systemFolder.toLowerCase()] || FolderOpen : FolderOpen
    const isActive = activeFolder === folder.systemFolder || activeFolder === folder.id

    return (
      <button
        key={folder.id}
        onClick={() => onFolderSelect(folder.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate capitalize">{folder.name.toLocaleLowerCase()}</span>
        {folder.unreadCount && folder.unreadCount > 0 && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded-full",
              isActive ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20",
            )}
          >
            {folder.unreadCount}
          </span>
        )}
      </button>
    )
  }

  if (isLoading) {
    return (
      <div className="w-64 border-r border-border h-full flex flex-col bg-muted/30">
        <div className="p-4">
          <Button disabled className="w-full" size="lg">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="px-2 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-border h-full flex flex-col bg-muted/30">
      <div className="p-4">
        <Button onClick={onCompose} className="w-full bg-primary" size="lg">
          <Plus className="w-4 h-4 mr-2" color="white" />
          Compose
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">{systemFolders.map(renderFolderItem)}</div>

        {customFolders.length > 0 && (
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setShowAllFolders(!showAllFolders)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showAllFolders ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>Folders</span>
              <span className="text-xs">({customFolders.length})</span>
            </button>
            {showAllFolders && <div className="space-y-1 mt-1">{customFolders.map(renderFolderItem)}</div>}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}