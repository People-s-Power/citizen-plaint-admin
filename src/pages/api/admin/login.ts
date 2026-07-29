import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

/** Admin console sign-in. No session required (that's the point). */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["POST"])) return

  return forwardToAdminApi(req, res, {
    path: "/login",
    method: "POST",
    body: req.body,
    requireActor: false,
  })
}
