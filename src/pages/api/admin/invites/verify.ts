import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

/**
 * Public: called by the invite-accept page before the invitee has a session,
 * so `requireActor` is disabled.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["GET"])) return

  return forwardToAdminApi(req, res, {
    path: "/invites/verify",
    method: "GET",
    query: { token: req.query.token },
    requireActor: false,
  })
}
