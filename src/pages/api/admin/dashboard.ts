import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminApi, methodGuard } from "@/lib/adminProxy"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ["GET"])) return
  return forwardToAdminApi(req, res, { path: "/dashboard", method: "GET" })
}
