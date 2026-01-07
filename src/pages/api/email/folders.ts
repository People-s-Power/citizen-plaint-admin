import type { NextApiRequest, NextApiResponse } from "next"
import nylas from "@/lib/nylas"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const grantId = Array.isArray(req.query.grantId) ? req.query.grantId[0] : (req.query.grantId as string | undefined)

  if (!grantId) {
    return res.status(400).json({ error: "Grant ID required" })
  }

  try {
    const folders = await nylas.folders.list({
      identifier: grantId,
    })

    return res.status(200).json(folders)
  } catch (error) {
    console.error("Error fetching folders:", error)
    return res.status(500).json({ error: "Failed to fetch folders" })
  }
}
