import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

/**
 * Rehydrates the current admin's identity + permissions.
 *
 * The dashboard calls this on boot so a revoked permission or a suspension is
 * reflected immediately, rather than trusting whatever was cached at login.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["GET"])) return

  return forwardToAdminApi(req, res, { path: "/me", method: "GET" })
}
