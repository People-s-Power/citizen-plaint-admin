import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query"

const BASE_URL = "/api"

export async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { ...options.headers },
    credentials: "include",
    ...options,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Request failed")
  return data
}

export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T, Error, T, string[]>, "queryKey" | "queryFn">,
) {
  return useQuery<T, Error, T, string[]>({
    queryKey: key,
    queryFn: () => request<T>(url),
    ...options,
  })
}

export function useApiMutation<T, TVariables = unknown>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options?: Omit<UseMutationOptions<T, Error, TVariables>, "mutationFn">,
) {
  return useMutation<T, Error, TVariables>({
    mutationFn: (data) => {
      const isFormData = data instanceof FormData

      return request<T>(url, {
        method,
        body: isFormData ? (data as FormData) : JSON.stringify(data),
        headers: isFormData ? {} : { "Content-Type": "application/json" },
      })
    },
    ...options,
  })
}

interface CustomMutationPayload {
  url: string
  data: unknown
  method?: "POST" | "PUT" | "PATCH" | "DELETE"
}

export function useCustomUrlApiMutation<T>(
  defaultMethod: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: Omit<UseMutationOptions<T, Error, CustomMutationPayload>, "mutationFn">,
) {
  return useMutation<T, Error, CustomMutationPayload>({
    mutationFn: (payload) => {
      const isFormData = payload.data instanceof FormData
      const httpMethod = payload.method || defaultMethod

      return request<T>(payload.url, {
        method: httpMethod,
        body: isFormData ? (payload.data as FormData) : JSON.stringify(payload.data),
        headers: isFormData ? {} : { "Content-Type": "application/json" },
      })
    },
    ...options,
  })
}
