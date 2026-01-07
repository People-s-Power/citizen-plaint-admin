import {
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Tag,
  FolderInput,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
// import { ChannelAssignmentModal } from "../channel-assign-modal"

interface EmailToolbarProps {
  selectedCount: number
  totalCount: number
  allSelected: boolean
  onSelectAll: (checked: boolean) => void
  onArchive: () => void
  onDelete: () => void
  onMarkRead: () => void
  onMarkUnread: () => void
  onRefresh: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function EmailToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onArchive,
  onDelete,
  onMarkRead,
  onMarkUnread,
  onRefresh,
  searchQuery,
  onSearchChange,
}: EmailToolbarProps) {
  return (
    <div className="border-b border-border px-4 py-2 flex items-center gap-2">
      <Checkbox
        checked={allSelected && totalCount > 0}
        onCheckedChange={(checked) => onSelectAll(!!checked)}
        disabled={totalCount === 0}
      />

      {selectedCount > 0 ? (
        <>
          <span className="text-sm text-muted-foreground ml-2">{selectedCount} selected</span>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="icon" onClick={onArchive} title="Archive">
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onMarkRead} title="Mark as read">
              <MailOpen className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onMarkUnread} title="Mark as unread">
              <Mail className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <FolderInput className="w-4 h-4 mr-2" />
                  Move to folder
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Tag className="w-4 h-4 mr-2" />
                  Add label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        <>
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Input
            type="search"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs ml-2"
          />
        </>
      )}

      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <span>{totalCount > 0 ? `1-${Math.min(50, totalCount)} of ${totalCount}` : "0 messages"}</span>

        {/* <ChannelAssignmentModal channelType="email" /> */}
      </div>
    </div>
  )
}
