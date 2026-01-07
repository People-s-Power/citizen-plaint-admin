import type { NextApiRequest, NextApiResponse } from "next"
import nylas from "@/lib/nylas"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const grantId = Array.isArray(req.query.grantId) ? req.query.grantId[0] : (req.query.grantId as string | undefined)
  const { folderId, limit = "50" } = req.query

  if (!grantId) {
    return res.status(400).json({ error: "Grant ID required" })
  }

  try {
    const queryParams: Record<string, any> = {
      limit: Number.parseInt(limit as string, 10),
    }

    if (folderId) {
      queryParams.in = [folderId as string]
    }

    const threads = await nylas.threads.list({
      identifier: grantId,
      queryParams,
    })

    return res.status(200).json(threads)
  } catch (error) {
    console.error("Error fetching threads:", error)
    return res.status(500).json({ error: "Failed to fetch threads" })
  }
}