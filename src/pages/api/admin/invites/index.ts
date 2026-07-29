import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["GET", "POST"])) return

  if (req.method === "GET") {
    const { status, search, page, limit } = req.query
    return forwardToAdminApi(req, res, {
      path: "/invites",
      method: "GET",
      query: { status, search, page, limit },
    })
  }

  return forwardToAdminApi(req, res, {
    path: "/invites",
    method: "POST",
    body: req.body,
  })
}
