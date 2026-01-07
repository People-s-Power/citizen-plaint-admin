import type { NextApiRequest, NextApiResponse } from "next"
import nylas from "@/lib/nylas"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const grantId = Array.isArray(req.query.grantId) ? req.query.grantId[0] : (req.query.grantId as string | undefined)
  const { id } = req.query

  if (!grantId) {
    return res.status(400).json({ error: "Grant ID required" })
  }

  if (req.method === "GET") {
    try {
      const message = await nylas.messages.find({
        identifier: grantId,
        messageId: id as string,
      })

      return res.status(200).json(message)
    } catch (error) {
      console.error("Error fetching message:", error)
      return res.status(500).json({ error: "Failed to fetch message" })
    }
  }

  if (req.method === "PUT") {
    // Update message (mark as read/unread, starred, etc.)
    try {
      const { unread, starred } = req.body

      const message = await nylas.messages.update({
        identifier: grantId,
        messageId: id as string,
        requestBody: {
          unread,
          starred,
        },
      })

      return res.status(200).json(message)
    } catch (error) {
      console.error("Error updating message:", error)
      return res.status(500).json({ error: "Failed to update message" })
    }
  }

  if (req.method === "DELETE") {
    try {
      await nylas.messages.destroy({
        identifier: grantId,
        messageId: id as string,
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error("Error deleting message:", error)
      return res.status(500).json({ error: "Failed to delete message" })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
