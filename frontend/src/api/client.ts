import { ENV } from '../config/env.config'

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined

  constructor(status: number, code: string | undefined) {
    super(code ?? 'HTTP ' + status)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function readErrorCode(response: Response): Promise<string | undefined> {
  if (!response.headers.get('Content-Type')?.includes('application/json')) {
    return undefined
  }

  const body: unknown = await response.json().catch(() => null)
  if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
    return body.code
  }

  return undefined
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const url = ENV.API_URL + path
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  const response = ENV.NATIVE_HTTP
    ? await (await import('@tauri-apps/plugin-http')).fetch(url, {
        ...options,
        headers,
        maxRedirections: 0,
      })
    : await fetch(url, { ...options, headers })

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorCode(response))
  }

  return response.json() as Promise<T>
}

function sendJson<T>(method: 'POST' | 'PATCH', path: string, body?: unknown, signal?: AbortSignal) {
  return request<T>(path, {
    method,
    signal,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export const apiClient = {
  get<T>(path: string, signal?: AbortSignal) {
    return request<T>(path, { signal })
  },
  post<T>(path: string, body?: unknown, signal?: AbortSignal) {
    return sendJson<T>('POST', path, body, signal)
  },
  patch<T>(path: string, body: unknown) {
    return sendJson<T>('PATCH', path, body)
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  },
}
