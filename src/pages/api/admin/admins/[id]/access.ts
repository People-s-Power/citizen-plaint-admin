import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["PATCH"])) return

  const { id } = req.query
  return forwardToAdminApi(req, res, {
    path: `/admins/${encodeURIComponent(String(id))}/access`,
    method: "PATCH",
    body: req.body,
  })
}
