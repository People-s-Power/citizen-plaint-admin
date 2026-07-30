import type { NextApiRequest, NextApiResponse } from "next"

const SERVER_URL =
  process.env.API_SERVER_URL ||
  "https://people-powapi-v5-5ifxz.ondigitalocean.app"

const BACKEND_BASE = `${SERVER_URL}/api/v5`
const GRAPHQL_URL = `${SERVER_URL}/graphql`

function getBearerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization
  if (typeof header === "string" && /^Bearer\s+/i.test(header)) {
    return header.replace(/^Bearer\s+/i, "").trim()
  }

  const actorHeader = req.headers["x-admin-actor-token"]
  if (typeof actorHeader === "string" && actorHeader.trim()) {
    return actorHeader.replace(/^Bearer\s+/i, "").trim()
  }

  const cookie = req.cookies?.token
  return cookie ? String(cookie) : null
}

function getAdminApiKey(): string {
  return process.env.ADMIN_API_KEY || ""
}

function getPathSegments(req: NextApiRequest): string[] {
  const raw = req.query.path
  if (Array.isArray(raw)) return raw
  if (typeof raw === "string") return [raw]
  return []
}

async function forwardGraphQL(
  req: NextApiRequest,
  res: NextApiResponse,
  query: string,
  variables: Record<string, unknown>,
  successMapper: (data: any) => any,
) {
  const token = getBearerToken(req)
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload?.errors) {
    const message = Array.isArray(payload?.errors)
      ? payload.errors.map((error: any) => error?.message).filter(Boolean).join(", ")
      : payload?.message || "Request failed"
    return res.status(response.status || 500).json({ message })
  }

  return res.status(200).json(successMapper(payload?.data || {}))
}

async function forwardToBackend(req: NextApiRequest, res: NextApiResponse, path: string[]) {
  const url = new URL(`${BACKEND_BASE}/${path.join("/")}`)
  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") return
    if (Array.isArray(value)) {
      value.forEach((entry) => url.searchParams.append(key, String(entry)))
      return
    }
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value))
    }
  })

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = getBearerToken(req)
  if (token) headers.Authorization = `Bearer ${token}`

  if (path[0] === "admin") {
    const apiKey = getAdminApiKey()
    if (apiKey) headers["x-admin-api-key"] = apiKey
    if (token) headers["x-admin-actor-token"] = token
  }

  const response = await fetch(url.toString(), {
    method: req.method || "GET",
    headers,
    body:
      req.method && ["POST", "PATCH", "PUT", "DELETE"].includes(req.method)
        ? JSON.stringify(req.body ?? {})
        : undefined,
  })

  const text = await response.text()
  let data: any = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = text ? { message: text } : {}
  }

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || "Request failed"
    return res.status(response.status).json({ ...data, message })
  }

  return res.status(response.status === 204 ? 200 : response.status).json(data)
}

async function handleTaskProxy(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string[],
) {
  const token = getBearerToken(req)
  const taskId = path[2]

  if (req.method === "GET") {
    return forwardGraphQL(
      req,
      res,
      `
        query DashboardTasks(
          $page: Int!
          $limit: Int!
          $orgId: ID
          $status: String
        ) {
          tasks(page: $page, limit: $limit, orgId: $orgId, status: $status) {
            tasks {
              _id
              name
              dueDate
              dueTime
              instruction
              status
              lock
              createdAt
              updatedAt
              author { _id name image email }
              prof { _id name image email }
              assigne { _id name image email }
              asset { url type }
              images
              subtasks {
                title
                priority
                actions
                attachment { url type }
                images
                description {
                  title
                  priority
                  actions
                  attachment { url type }
                  images
                  done
                }
              }
              comments {
                _id
                authorId
                authorName
                authorImage
                content
                targetType
                subtaskIndex
                descriptionIndex
                createdAt
                updatedAt
                replies {
                  _id
                  authorId
                  authorName
                  authorImage
                  content
                  createdAt
                  updatedAt
                }
              }
            }
            totalPages
          }
        }
      `,
      {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20),
        orgId: req.query.orgId ? String(req.query.orgId) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
      },
      (data) => ({
        data: {
          tasks: data.tasks,
        },
      }),
    )
  }

  if (req.method === "POST" && taskId) {
    return forwardGraphQL(
      req,
      res,
      `
        mutation UpdateTask($input: UpdateTaskInput!) {
          updateTask(updateTaskInput: $input) {
            _id
            lock
            status
          }
        }
      `,
      {
        input: {
          id: taskId,
          status: req.body?.status,
          prof: req.body?.prof,
        },
      },
      (data) => ({
        data: {
          task: data.updateTask,
        },
      }),
    )
  }

  return res.status(405).json({ message: `Method ${req.method} not allowed` })
}

async function handleReviewProxy(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  return forwardGraphQL(
    req,
    res,
    `
      mutation CreateReview(
        $body: String!
        $rating: Int!
        $userId: String!
        $author: String!
      ) {
        createReview(body: $body, rating: $rating, userId: $userId, author: $author) {
          body
          rating
          userId { _id name image }
          author { _id name image }
        }
      }
    `,
    {
      body: req.body?.body,
      rating: Number(req.body?.rating || 0),
      userId: req.body?.userId,
      author: req.body?.author,
    },
    (data) => ({
      message: "Review submitted successfully",
      review: data.createReview,
    }),
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const path = getPathSegments(req)
  if (!path.length) {
    return res.status(404).json({ message: "Route not found" })
  }

  if (path[0] === "auth" && path[1] === "task") {
    return handleTaskProxy(req, res, path)
  }

  if (path[0] === "auth" && path[1] === "review") {
    return handleReviewProxy(req, res)
  }

  return forwardToBackend(req, res, path)
}
