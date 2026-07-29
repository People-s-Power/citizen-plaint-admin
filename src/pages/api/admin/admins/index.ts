import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["GET"])) return

  const { status, search, page, limit } = req.query
  return forwardToAdminApi(req, res, {
    path: "/admins",
    method: "GET",
    query: { status, search, page, limit },
  })
}
