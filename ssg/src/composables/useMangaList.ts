import { onMounted } from 'vue'
import type { Manga } from '../classes/manga'
import { tryMigrateMangaList } from '../services/migrationService'
import type { DialogChainObject } from 'quasar'
import { LocalStorage, useQuasar } from 'quasar'
import SearchDialog from '../components/SearchDialog.vue'
import SiteDialog from '../components/SiteDialog.vue'
import EditMangaItemDialog from '../components/EditMangaItemDialog.vue'
import { NotifyOptions } from 'src/classes/notifyOptions'
import { getMangaInfoByUrl, getSite, searchManga } from 'src/services/siteService'
import { SiteType } from 'src/enums/siteEnum'
import { LinkingSiteType } from 'src/enums/linkingSiteEnum'
import relevancy from 'relevancy'
import constants from 'src/classes/constants'
import { stateManager } from 'src/store/store-reader'

export default function useMangaList(): {
  addManga: (manga: Manga) => boolean
  storeManga: () => void
  showAddMangaDialog: () => Promise<string | undefined>
  showUpdateMangaDialog: (query: string) => Promise<string | undefined>
  showEditMangaDialog: (url: string) => Promise<void>
  fetchManga: (url: string) => Promise<Manga | undefined>
  findManga: (siteTypeName: string, query: string, excludedUrls: string[]) => Promise<boolean>
} {
  const { notification$, searchResults$, getManga, getMangaList } = stateManager

  const addManga = (manga: Manga): boolean => {
    const existingManga = getManga(manga.url)
    if (existingManga) {
      notification$.next(new NotifyOptions(Error('Manga already exists')))
      return false
    }

    stateManager.addManga(manga)
    return true
  }

  const storeManga = (): void => {
    setTimeout(() => {
      LocalStorage.set(constants.MANGA_LIST_KEY, getMangaList())
    }, 0)
  }

  const $q = useQuasar()
  const showMangaDialog = (type: string, query = ''): Promise<string | undefined> => {
    return new Promise((resolve) => {
      $q.dialog({
        component: SearchDialog,
        componentProps: {
          title: `${type} manga`,
          searchPlaceholder: 'Search for a manga',
          manualPlaceholder: 'Or enter a manga url manually',
          confirmButton: type,
          initialSearch: query,
        },
      })
        .onOk((url: string) => {
          resolve(url)
        })
        .onDismiss(() => {
          if (siteDialog) {
            siteDialog.hide()
          }
          resolve(undefined)
        })

      const siteDialog: DialogChainObject | undefined = $q.dialog({
        component: SiteDialog,
      })
    })
  }

  const showAddMangaDialog = (): Promise<string | undefined> => showMangaDialog('Add')
  const showUpdateMangaDialog = (query: string): Promise<string | undefined> => showMangaDialog('Update', query)

  const showEditMangaDialog = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      $q.dialog({
        component: EditMangaItemDialog,
        componentProps: {
          url,
        },
      })
        .onOk(() => {
          resolve()
        })
        .onDismiss(() => {
          resolve()
        })
    })
  }

  const fetchManga = async (url: string): Promise<Manga | undefined> => {
    let manga: Manga | Error
    try {
      manga = await getMangaInfoByUrl(url)
    } catch (error) {
      notification$.next(new NotifyOptions(error as string | Error))
      return undefined
    }

    if (manga instanceof Error) {
      notification$.next(new NotifyOptions(manga))
      return undefined
    } else {
      manga.read = '0'
      manga.readNum = 0
      return manga
    }
  }

  const searchSite = (siteType: SiteType | LinkingSiteType, query: string, excludedUrls: string[]): boolean => {
    const site = getSite(siteType)
    if (site === undefined) return false
    if (site.loggedIn) return true

    site
      .openLogin($q)
      .then((loggedIn) => {
        if (loggedIn instanceof Error) {
          notification$.next(new NotifyOptions(loggedIn))
          return
        }
        if (!loggedIn) return

        const notifyOptions = new NotifyOptions('Logged in successfully!')
        notifyOptions.type = 'positive'
        notification$.next(notifyOptions)

        findManga(siteType, query, excludedUrls).catch((error: Error) => {
          notification$.next(new NotifyOptions(error))
        })
      })
      .catch((error: Error) => {
        notification$.next(new NotifyOptions(error))
      })

    return false
  }

  const findManga = async (siteTypeName: string, query: string, excludedUrls: string[]): Promise<boolean> => {
    const siteType =
      Object.values(SiteType).find((curSiteType) => {
        return siteTypeName === curSiteType.toString()
      }) ??
      Object.values(LinkingSiteType).find((curSiteType) => {
        return siteTypeName === curSiteType.toString()
      })

    if (siteTypeName !== '') {
      if (siteType === undefined) return false
      const loggedIn = searchSite(siteType, query, excludedUrls)
      if (!loggedIn) return false
    }

    if (!query) return false

    $q.loading.show({
      delay: 100,
    })

    let result: Manga[]
    try {
      result = await searchManga(query, siteType)
    } catch (error) {
      notification$.next(new NotifyOptions(error as string | Error))
      $q.loading.hide()
      return false
    }

    // Some websites return results from other websites...
    const processedResults: string[] = []

    const mangaResults = result.filter((resultManga) => {
      const alreadyAdded =
        !getManga(resultManga.url) &&
        !processedResults.includes(resultManga.url) &&
        !excludedUrls.includes(resultManga.url)
      processedResults.push(resultManga.url)

      return alreadyAdded
    })

    if (mangaResults.length === 0) {
      notification$.next(new NotifyOptions('No results found'))
    }

    searchResults$.next(
      mangaSearchSorter.sort(mangaResults, query, (obj, calc) => {
        return calc(obj.title)
      }),
    )
    $q.loading.hide()

    return true
  }

  return {
    addManga,
    storeManga,
    showAddMangaDialog,
    showUpdateMangaDialog,
    showEditMangaDialog,
    fetchManga,
    findManga,
  }
}

export function useAppMangaList(): void {
  const { setMangaList } = stateManager

  onMounted(async () => {
    try {
      await tryMigrateMangaList()
    } catch (error) {
      console.error(error)
    }

    const localMangaList: Manga[] = LocalStorage.getItem(constants.MANGA_LIST_KEY) ?? []
    setMangaList(localMangaList)
  })
}

const mangaSearchSorter = new relevancy.Sorter({
  comparator: (a: Manga, b: Manga): number => {
    return mangaSort(a, b)
  },
})

function mangaSort(a: Manga, b: Manga): number {
  return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
}
