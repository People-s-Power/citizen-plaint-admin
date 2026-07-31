import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ["GET"])) return
  const { page, limit, search, status, accountType, country, profession } = req.query
  return forwardToAdminApi(req, res, {
    path: "/users",
    method: "GET",
    query: { page, limit, search, status, accountType, country, profession },
  })
}
