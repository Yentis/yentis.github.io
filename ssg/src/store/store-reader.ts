import type { Manga } from '../classes/manga'
import type { NotifyOptions } from '../classes/notifyOptions'
import { Settings } from '../classes/settings'
import type { UrlNavigation } from '../classes/urlNavigation'
import { BehaviorSubject, Subject } from 'rxjs'

class StateManager {
  init$ = new Subject<void>()
  siteListFetched$ = new BehaviorSubject(false)

  mangaMap$ = new BehaviorSubject<Map<string, Manga>>(new Map())
  refreshing$ = new BehaviorSubject(false)
  urlNavigation$ = new BehaviorSubject<UrlNavigation | undefined>(undefined)
  notification$ = new BehaviorSubject<NotifyOptions | undefined>(undefined)
  errors$ = new BehaviorSubject<NotifyOptions[]>([])
  mobileView$ = new BehaviorSubject(false)
  pushNotifications$ = new BehaviorSubject<Map<string, number>>(new Map())
  searchResults$ = new BehaviorSubject<Manga[]>([])
  searchValue$ = new BehaviorSubject('')
  settings$ = new BehaviorSubject(new Settings())

  getMangaList = (): Manga[] => {
    return Array.from(this.mangaMap$.value.values())
  }

  getManga = (url: string): Manga | undefined => {
    return this.mangaMap$.value.get(url)
  }

  setMangaList = (mangaList: Manga[]): void => {
    const map = new Map<string, Manga>()

    mangaList.forEach((manga) => map.set(manga.url, manga))
    this.mangaMap$.next(map)
  }

  addManga(manga: Manga): void {
    this.mangaMap$.value.set(manga.url, manga)
    this.mangaMap$.next(this.mangaMap$.value)
  }

  removeManga = (url: string): void => {
    this.mangaMap$.value.delete(url)
    this.mangaMap$.next(this.mangaMap$.value)
  }

  setManga = (options: { url?: string; manga: Manga }): void => {
    const url = options.url ?? options.manga.url

    if (url !== options.manga.url) {
      this.mangaMap$.value.delete(url)
    }

    this.mangaMap$.value.set(options.manga.url, options.manga)
    this.mangaMap$.next(this.mangaMap$.value)
  }

  addError = (error: NotifyOptions): void => {
    this.errors$.value.push(error)
    this.errors$.next(this.errors$.value)
  }

  addPushNotification = (options: { url: string; id: number }): void => {
    const { url, id } = options
    this.pushNotifications$.value.set(url, id)
    this.pushNotifications$.next(this.pushNotifications$.value)
  }

  removePushNotification = (url: string): void => {
    this.pushNotifications$.value.delete(url)
    this.pushNotifications$.next(this.pushNotifications$.value)
  }
}

export const stateManager = new StateManager()
