import { Method } from 'axios'

export default interface HttpRequest {
  method: Method,
  url: string,
  data?: string | Record<string, unknown>,
  headers?: Record<string, string>
}
