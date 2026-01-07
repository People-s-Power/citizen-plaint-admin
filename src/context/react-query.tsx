"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                        retry: (failureCount, error: any) => {
                            if (error?.statusCode >= 400 && error?.statusCode < 500) {
                                if (error.statusCode === 408 || error.statusCode === 429) {
                                    return failureCount < 2
                                }
                                return false
                            }
                            // Retry on 5xx errors and network errors
                            return failureCount < 3
                        },
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        retry: (failureCount, error: any) => {
                            // Don't retry mutations on client errors
                            if (error?.statusCode >= 400 && error?.statusCode < 500) {
                                return false
                            }
                            return failureCount < 2
                        },
                    },
                },
            }),
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
