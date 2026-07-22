import type { NextApiRequest, NextApiResponse } from "next"

const SERVER_URL = "https://people-powapi-v5-5ifxz.ondigitalocean.app"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { search, limit } = req.query
    const params = new URLSearchParams()
    if (search) params.append("search", String(search))
    if (limit) params.append("limit", String(limit))

    const url = `${SERVER_URL}/api/v5/organization/available-professionals?${params.toString()}`
    const token = req.headers.authorization || ""

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error: any) {
    console.error("Available professionals proxy error:", error)
    return res.status(500).json({ message: error.message || "Internal server error" })
  }
}
