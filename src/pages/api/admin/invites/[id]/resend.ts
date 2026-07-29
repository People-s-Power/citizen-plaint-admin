import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["POST"])) return

  const { id } = req.query
  return forwardToAdminApi(req, res, {
    path: `/invites/${encodeURIComponent(String(id))}/resend`,
    method: "POST",
    body: req.body || {},
  })
}
