import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

/** Authoritative permission catalog + role presets from the backend. */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!methodGuard(req, res, ["GET"])) return

  return forwardToAdminApi(req, res, { path: "/permissions", method: "GET" })
}
