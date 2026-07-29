import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

/** DELETE removes admin access entirely (the member account is untouched). */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["DELETE"])) return

  const { id } = req.query
  return forwardToAdminApi(req, res, {
    path: `/admins/${encodeURIComponent(String(id))}`,
    method: "DELETE",
  })
}
