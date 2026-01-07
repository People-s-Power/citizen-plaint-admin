import type { NextApiRequest, NextApiResponse } from "next"
import nylas from "@/lib/nylas"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const grantId = req.headers["x-grant-id"] as string
  const { folderId, limit = "25", pageToken, searchQuery } = req.query

  if (!grantId) {
    return res.status(400).json({ error: "Grant ID required" })
  }

  try {
    const queryParams: Record<string, any> = {
      limit: Number.parseInt(limit as string, 10),
    }

    if (pageToken) {
      queryParams.page_token = pageToken as string
    }

    if (searchQuery) {
      queryParams.search_query_native = searchQuery as string
    }

    if (folderId) {
      queryParams.in = [folderId as string]
    }

    const messages = await nylas.messages.list({
      identifier: grantId,
      queryParams,
    })

    return res.status(200).json({
      data: messages.data,
      nextCursor: messages.nextCursor || null,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return res.status(500).json({ error: "Failed to fetch messages" })
  }
}