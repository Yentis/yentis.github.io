import HttpRequest from 'src/interfaces/httpRequest'
import HttpResponse from 'src/interfaces/httpResponse'

export const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Mobile Safari/537.36'
export const HEADER_USER_AGENT = 'User-Agent'

export function getCookies (data: HttpResponse | string): Record<string, string | undefined> {
  const cookies: Record<string, string | undefined> = {}
  let cookieData: string | string[]

  if (typeof data === 'string') {
    cookieData = data
  } else {
    cookieData = data.headers['set-cookie'] || ''
  }

  let cookieString: string
  if (Array.isArray(cookieData)) {
    cookieString = cookieData.join(';')
  } else cookieString = cookieData

  cookieString.split(';').forEach((cookieParts) => {
    cookieParts.split(',').forEach((cookie) => {
      const split = cookie.split('=')
      const key = split[0]?.trim()
      if (!key) return

      cookies[key] = split[1]
    })
  })

  return cookies
}

export default abstract class BaseRequest {
  abstract sendRequest (request: HttpRequest, ignoreErrorStatus?: boolean): Promise<HttpResponse>

  protected convertToUrlEncoded (data?: string): string {
    const parsedData = JSON.parse(data || '{}') as Record<string, string>

    return Object.entries(parsedData)
      .map(([key, value]) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      })
      .join('&')
  }
}
