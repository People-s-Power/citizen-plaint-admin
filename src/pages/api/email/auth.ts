import type { NextApiRequest, NextApiResponse } from "next"
import nylas from "@/lib/nylas"
import { HTTP_URI, NYLAS_CLIENT_ID } from "@/utils/constants"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" })
  }

  try {
    const backendUrl = HTTP_URI
    const redirectUri = `${backendUrl}/nylas/callback`
    
    const authUrl = nylas.auth.urlForOAuth2({
      clientId: NYLAS_CLIENT_ID,
      redirectUri: redirectUri,
      state: userId as string,
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
      ],
    })

    return res.status(200).json({ authUrl })
  } catch (error) {
    console.error("Error generating auth URL:", error)
    return res.status(500).json({ error: "Failed to generate auth URL" })
  }
}