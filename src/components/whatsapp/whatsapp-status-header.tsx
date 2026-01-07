"use client"

import { useWhatsAppStatus } from "@/hooks/use-whatsapp"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Loader2, AlertCircle, Info, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { WhatsAppDisconnectModal } from "./whatsapp-disconnect-modal"
// import { ChannelAssignmentModal } from "../channel-assign-modal"

interface WhatsAppStatusHeaderProps {
  userId: string
}

export function WhatsAppStatusHeader({ userId }: WhatsAppStatusHeaderProps) {
  const { data, isLoading, refetch, isFetching } = useWhatsAppStatus(userId)
  const status = data?.status

  console.log("WhatsApp Status:", status)

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }

    if (!status) {
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }

    if (data.connected && data.status === "ONLINE") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    }

    if (data.status === "CREATING") {
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
    }

    if (data.status === "OFFLINE" || !data.connected) {
      return <XCircle className="h-4 w-4 text-red-600" />
    }

    return <AlertCircle className="h-4 w-4 text-amber-600" />
  }

  const getStatusBadgeVariant = () => {
    if (!status) return "secondary"
    if (data.connected && data.status === "ONLINE") return "default"
    if (data.status === "CREATING") return "secondary"
    if (data.status === "OFFLINE" || !data.connected) return "destructive"
    return "secondary"
  }

  const getStatusText = () => {
    if (isLoading) return "Checking..."
    if (!status) return "Unknown"
    if (data.connected && data.status === "ONLINE") return "Connected"
    if (data.status === "CREATING") return "Setting up"
    if (data.status === "OFFLINE") return "Offline"
    if (data.status === "PAUSED") return "Paused"
    if (data.status === "DELETED") return "Deleted"
    return "Not connected"
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">WhatsApp Status</span>
        </div>
        <Badge
          variant={getStatusBadgeVariant()}
          className={cn(
            "text-xs",
            data?.connected &&
              data.status === "ONLINE" &&
              "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          )}
        >
          {getStatusText()}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {data?.statistics && (
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mr-2">
            <span>
              <span className="font-semibold text-foreground">{data.statistics.totalConversations}</span>{" "}
              conversations
            </span>
            {data.statistics.unreadMessages > 0 && (
              <span>
                <span className="font-semibold text-red-600">{data.statistics.unreadMessages}</span> unread
              </span>
            )}
          </div>
        )}

        {/* <ChannelAssignmentModal channelType="whatsapp" /> */}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Connection Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{data?.status || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connected:</span>
                    <span className="font-medium">{data?.connected ? "Yes" : "No"}</span>
                  </div>
                  {data?.statusMessage && (
                    <p className="text-xs text-muted-foreground pt-2">{data.statusMessage}</p>
                  )}
                </div>
              </div>

              <Separator />

              {data?.user && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Account Details</h4>
                  <div className="space-y-2 text-sm">
                    {data.user.whatsappNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number:</span>
                        <span className="font-medium font-mono text-xs">{data.user.whatsappNumber}</span>
                      </div>
                    )}
                    {data.user.whatsappDisplayName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Display Name:</span>
                        <span className="font-medium">{data.user.whatsappDisplayName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data?.statistics && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Conversations:</span>
                        <span className="font-medium">{data.statistics.totalConversations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unread Messages:</span>
                        <span className="font-medium">{data.statistics.unreadMessages}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {data?.checkedAt && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    Last checked: {new Date(data.checkedAt).toLocaleTimeString()}
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>

        {/* <WhatsAppDisconnectModal userId={userId} /> */}
      </div>
    </div>
  )
}
