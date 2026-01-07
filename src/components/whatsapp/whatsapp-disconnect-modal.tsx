"use client"

import { useState } from "react"
import { useDisconnectWhatsApp } from "@/hooks/use-whatsapp"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface WhatsAppDisconnectModalProps {
  userId: string
}

export function WhatsAppDisconnectModal({ userId }: WhatsAppDisconnectModalProps) {
  const [open, setOpen] = useState(false)
  const disconnectMutation = useDisconnectWhatsApp()

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.disconnectWhatsApp({ userId })
      toast.success("WhatsApp account disconnected successfully")
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect WhatsApp")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Disconnect WhatsApp</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Disconnect WhatsApp Account?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p className="font-medium text-foreground">This action is permanent and cannot be undone.</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Your WhatsApp subaccount will be closed.</li>
              <li>All conversations and messages will be permanently deleted from our system.</li>
              <li>Any registered sender numbers will be disconnected.</li>
              <li>You will need to go through the onboarding process again to reconnect.</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disconnectMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDisconnect()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
