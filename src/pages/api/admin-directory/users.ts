import type { NextApiRequest, NextApiResponse } from "next"
import { forwardToAdminDirectory, methodGuard } from "@/lib/adminProxy"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!methodGuard(req, res, ["GET"])) return
  return forwardToAdminDirectory(req, res, "/users")
}
