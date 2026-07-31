import type { NextApiRequest, NextApiResponse } from "next"

/**
 * Server-side proxy helper for the admin governance API.
 *
 * Why proxy at all? The backend requires `ADMIN_API_KEY`, which must never
 * reach the browser. These handlers run on the Next.js server, attach the key,
 * and forward the caller's admin session token so the backend can identify
 * *which* administrator is acting.
 */

const SERVER_URL =
  process.env.API_SERVER_URL ||
  "https://people-powapi-v5-5ifxz.ondigitalocean.app"

export const ADMIN_API_BASE = `${SERVER_URL}/api/v5/admin`
export const ADMIN_DIRECTORY_BASE = `${SERVER_URL}/api/v5/admin-directory`

/** Pull the admin's session JWT off the incoming request. */
export function getActorToken(req: NextApiRequest): string | null {
  const header = req.headers["x-admin-actor-token"]
  if (typeof header === "string" && header.trim()) return header.trim()

  const auth = req.headers.authorization
  if (typeof auth === "string" && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim()
  }

  // Fall back to the cookie the dashboard sets at login.
  const cookie = req.cookies?.token
  return cookie ? String(cookie) : null
}

interface ForwardOptions {
  /** Path relative to `/api/v5/admin`, e.g. `/invites`. */
  path: string
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  query?: Record<string, any>
  /** When false, the admin session token is not required (login, accept). */
  requireActor?: boolean
}

export async function forwardToAdminApi(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ForwardOptions,
) {
  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) {
    console.error(
      "[adminProxy] ADMIN_API_KEY is not set — refusing to call the admin API.",
    )
    return res.status(500).json({
      message:
        "Admin API is not configured on this server. Set ADMIN_API_KEY.",
    })
  }

  const requireActor = options.requireActor !== false
  const actorToken = getActorToken(req)
  if (requireActor && !actorToken) {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." })
  }

  const params = new URLSearchParams()
  Object.entries(options.query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value))
    }
  })
  const qs = params.toString()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-api-key": apiKey,
  }
  if (actorToken) headers["x-admin-actor-token"] = actorToken

  const forwardedFor = req.headers["x-forwarded-for"]
  if (typeof forwardedFor === "string") {
    headers["x-forwarded-for"] = forwardedFor
  }

  try {
    const response = await fetch(
      `${ADMIN_API_BASE}${options.path}${qs ? `?${qs}` : ""}`,
      {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      },
    )

    const text = await response.text()
    let data: any
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { message: text || "Unexpected response from the server" }
    }

    if (!response.ok) {
      // Nest returns `message` as string | string[]; flatten for the client.
      const message = Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message || "Request failed"
      return res.status(response.status).json({ ...data, message })
    }

    return res.status(response.status === 204 ? 200 : response.status).json(data)
  } catch (error: any) {
    console.error(`[adminProxy] ${options.method} ${options.path} failed:`, error)
    return res.status(502).json({
      message:
        "Could not reach the admin service. Please try again in a moment.",
    })
  }
}

/** Forward JWT-only, read-heavy admin directory requests. */
export async function forwardToAdminDirectory(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string,
) {
  const actorToken = getActorToken(req)
  if (!actorToken) return res.status(401).json({ message: "Your session has expired. Please sign in again." })

  const params = new URLSearchParams()
  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") return
    if (Array.isArray(value)) value.forEach((item) => params.append(key, String(item)))
    else if (value !== undefined && value !== null && value !== "") params.set(key, String(value))
  })

  try {
    const response = await fetch(`${ADMIN_DIRECTORY_BASE}${path}${params.toString() ? `?${params}` : ""}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${actorToken}` },
    })
    const text = await response.text()
    let data: any = {}
    try { data = text ? JSON.parse(text) : {} } catch { data = { message: text } }
    return res.status(response.status).json(data)
  } catch (error) {
    console.error(`[adminDirectoryProxy] GET ${path} failed:`, error)
    return res.status(502).json({ message: "Could not reach the admin directory service." })
  }
}

/** Guard for handlers that only accept specific verbs. */
export function methodGuard(
  req: NextApiRequest,
  res: NextApiResponse,
  allowed: string[],
): boolean {
  if (!allowed.includes(req.method || "")) {
    res.setHeader("Allow", allowed.join(", "))
    res.status(405).json({ message: `Method ${req.method} not allowed` })
    return false
  }
  return true
}
