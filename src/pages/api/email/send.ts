import type { NextApiRequest, NextApiResponse } from "next"
import nylas from "@/lib/nylas"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const grantId = (req.headers["x-grant-id"] as string) || (req.query.grantId as string)

  if (!grantId) {
    return res.status(400).json({ error: "Grant ID required" })
  }

  try {
    const { to, cc, bcc, subject, body, replyToMessageId } = req.body

    const message = await nylas.messages.send({
      identifier: grantId,
      requestBody: {
        to: to.map((recipient: { email: string; name?: string }) => ({
          email: recipient.email,
          name: recipient.name,
        })),
        cc: cc?.map((recipient: { email: string; name?: string }) => ({
          email: recipient.email,
          name: recipient.name,
        })),
        bcc: bcc?.map((recipient: { email: string; name?: string }) => ({
          email: recipient.email,
          name: recipient.name,
        })),
        subject,
        body,
        replyToMessageId,
      },
    })

    return res.status(200).json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return res.status(500).json({ error: "Failed to send message" })
  }
}