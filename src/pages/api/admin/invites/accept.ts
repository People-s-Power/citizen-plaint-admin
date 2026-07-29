import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

/** Public: claims an invitation and returns a fresh admin session token. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["POST"])) return

  return forwardToAdminApi(req, res, {
    path: "/invites/accept",
    method: "POST",
    body: req.body,
    requireActor: false,
  })
}
