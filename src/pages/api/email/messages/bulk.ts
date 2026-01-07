import type { NextApiRequest, NextApiResponse } from "next"
import { nylas } from "@/lib/nylas"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { grantId } = req.query
  const { messageIds, action } = req.body

  if (!grantId || typeof grantId !== "string") {
    return res.status(400).json({ message: "grantId is required" })
  }

  if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ message: "messageIds array is required" })
  }

  try {
    const updates: Record<string, any> = {}

    switch (action) {
      case "archive":
        // Move to archive folder - need to get archive folder ID first
        const foldersResponse = await nylas.folders.list({ identifier: grantId })
        const archiveFolder = foldersResponse.data.find(
          (f: any) => f.name?.toLowerCase() === "archive" || f.attributes?.includes("\\Archive"),
        )
        if (archiveFolder) {
          updates.folders = [archiveFolder.id]
        }
        break
      case "delete":
        // Move to trash
        const trashFoldersResponse = await nylas.folders.list({ identifier: grantId })
        const trashFolder = trashFoldersResponse.data.find(
          (f: any) => f.name?.toLowerCase() === "trash" || f.attributes?.includes("\\Trash"),
        )
        if (trashFolder) {
          updates.folders = [trashFolder.id]
        }
        break
      case "markRead":
        updates.unread = false
        break
      case "markUnread":
        updates.unread = true
        break
      case "star":
        updates.starred = true
        break
      case "unstar":
        updates.starred = false
        break
      default:
        return res.status(400).json({ message: "Invalid action" })
    }

    // Update each message
    await Promise.all(
      messageIds.map((messageId) =>
        nylas.messages.update({
          identifier: grantId,
          messageId,
          requestBody: updates,
        }),
      ),
    )

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error("Bulk update error:", error)
    return res.status(500).json({ message: error.message || "Failed to update messages" })
  }
}
