export type Method = 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'PURGE' | 'LINK' | 'UNLINK'

export interface HttpRequest {
  method: Method
  url: string
  data?: string
  headers?: Record<string, string>
}
