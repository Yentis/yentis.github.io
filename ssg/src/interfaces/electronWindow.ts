import type { HttpRequest } from './httpRequest'
import type HttpResponse from './httpResponse'
import type qs from 'qs'

export default interface ElectronWindow {
  mangaReader: {
    onDropboxToken: (event: unknown, queryString?: qs.ParsedQs) => void
    openURL: (url: string) => void
    sendRequest: (options: HttpRequest) => Promise<HttpResponse>
  }
}
