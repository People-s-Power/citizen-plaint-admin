import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

/** Suspend / reactivate an administrator. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["PATCH"])) return

  const { id } = req.query
  return forwardToAdminApi(req, res, {
    path: `/admins/${encodeURIComponent(String(id))}/status`,
    method: "PATCH",
    body: req.body,
  })
}
