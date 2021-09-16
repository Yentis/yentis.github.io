import { KitsuWorker } from 'src/classes/sites/kitsu/kitsuWorker'
import { SiteWorkerMessage } from 'src/classes/workerMessage/siteMessage'
import { KitsuRequestType } from 'src/enums/workerEnum'
import { handlePromise } from './helper'

export default function handleKitsuRequest (request: SiteWorkerMessage, worker: KitsuWorker): boolean {
  let promise: Promise<unknown> | undefined

  switch (request.type) {
    case KitsuRequestType.USER_ID:
      promise = worker.getUserId()
      break
    case KitsuRequestType.MANGA_SLUG:
      promise = worker.searchMangaSlug(request.data.get('url') as string)
      break
    case KitsuRequestType.LIBRARY_INFO:
      promise = worker.getLibraryInfo(request.data.get('mangaId') as string, request.data.get('userId') as string)
      break
    case KitsuRequestType.LOGIN:
      promise = worker.doLogin({ username: request.data.get('username') as string, password: request.data.get('password') as string })
      break
  }

  if (promise) {
    handlePromise(request.type, promise)
    return true
  }

  return false
}
