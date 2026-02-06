import type { Ref } from 'vue'
import { ref } from 'vue'
import type { RefreshOptions } from 'src/classes/refreshOptions'
import useMangaList from './useMangaList'
import { Status } from 'src/enums/statusEnum'
import { getMangaInfo } from 'src/services/siteService'
import { NotifyOptions } from 'src/classes/notifyOptions'
import { UrlNavigation } from 'src/classes/urlNavigation'
import usePushNotification from 'src/composables/usePushNotification'
import { getSiteNameByUrl } from 'src/utils/siteUtils'
import type ChromeWindow from 'src/interfaces/chromeWindow'
import { stateManager } from 'src/store/store-reader'

export default function useRefreshing(refreshProgress: Ref<number>): {
  refreshTimer: Ref<NodeJS.Timeout | undefined, NodeJS.Timeout | undefined>
  startRefreshTimer: (refreshOptions: RefreshOptions) => void
  refreshManga: (url: string, step?: number) => Promise<void>
  refreshAllManga: () => Promise<void>
} {
  const autoRefreshing = ref(false)
  const { storeManga } = useMangaList()
  const { sendPushNotification } = usePushNotification()
  const { urlNavigation$, notification$, refreshing$, getMangaList, getManga, setManga } = stateManager

  const refreshManga = async (url: string, step?: number): Promise<void> => {
    const manga = getManga(url)
    if (!manga) {
      if (step !== undefined) refreshProgress.value += step
      return
    }

    const result = await getMangaInfo(manga.url, manga.site, manga.altSources)
    if (result instanceof Error) {
      const errorMessage = (result.message.length === 0 ? result.stack : result.message) ?? 'Unknown'
      const message = `${getSiteNameByUrl(manga.site) ?? 'Unknown site'} | ${errorMessage}`

      const notifyOptions = new NotifyOptions(message, `Failed to refresh ${manga.title}`)
      notifyOptions.actions = [
        {
          label: 'Visit',
          handler: (): void => {
            urlNavigation$.next(new UrlNavigation(manga.url, true))
          },
          color: 'white',
        },
      ]

      notification$.next(notifyOptions)

      if (step !== undefined) refreshProgress.value += step
      return
    }

    if (autoRefreshing.value && manga.chapter !== result.chapter) {
      sendPushNotification(result)
    }

    const newManga = Object.assign({}, manga, {
      title: result.title,
      chapter: result.chapter,
      chapterUrl: result.chapterUrl,
      chapterNum: result.chapterNum,
      chapterDate: result.chapterDate,
      image: result.image,
    })

    if (step !== undefined) refreshProgress.value += step
    await new Promise<void>((resolve) => {
      const chromeWindow = window as unknown as ChromeWindow

      chromeWindow.requestIdleCallback(
        () => {
          setManga({ url: manga.url, manga: newManga })
          resolve()
        },
        { timeout: 2000 },
      )
    })
  }

  const refreshAllManga = async (): Promise<void> => {
    if (refreshing$.value) return
    refreshProgress.value = 0.01
    refreshing$.next(true)

    const filteredMangaUrlList: string[] = []

    getMangaList().forEach((manga) => {
      if (manga.status !== Status.READING && manga.shouldUpdate !== true) return
      filteredMangaUrlList.push(manga.url)
    })

    const step = filteredMangaUrlList.length > 0 ? 1 / filteredMangaUrlList.length : 0
    const promises = filteredMangaUrlList.map((url) => refreshManga(url, step))

    try {
      await Promise.all(promises)
    } finally {
      storeManga()
      autoRefreshing.value = false
      refreshing$.next(false)
      refreshProgress.value = 0
    }
  }

  const refreshTimer: Ref<ReturnType<typeof setTimeout> | undefined> = ref()
  const startRefreshTimer = (refreshOptions: RefreshOptions): void => {
    if (refreshTimer.value) clearTimeout(refreshTimer.value)
    refreshTimer.value = setTimeout(
      () => {
        refreshTimer.value = undefined
        if (!refreshOptions.enabled || refreshing$.value) {
          startRefreshTimer(refreshOptions)
          return
        }

        autoRefreshing.value = true
        refreshAllManga()
          .finally(() => {
            if (refreshTimer.value) return
            startRefreshTimer(refreshOptions)
          })
          .catch(console.error)
      },
      refreshOptions.period * 60 * 1000,
    )
  }

  return {
    refreshTimer,
    startRefreshTimer,
    refreshManga,
    refreshAllManga,
  }
}
