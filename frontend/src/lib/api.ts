const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"

interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

class ApiClientError extends Error {
  code: string
  details?: unknown

  constructor(error: ApiError["error"]) {
    super(error.message)
    this.code = error.code
    this.details = error.details
    this.name = "ApiClientError"
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiClientError(data as ApiError["error"])
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
}

export { ApiClientError }
export type { ApiError }
