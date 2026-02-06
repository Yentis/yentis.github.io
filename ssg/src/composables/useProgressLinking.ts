import { useQuasar } from 'quasar'
import { NotifyOptions } from 'src/classes/notifyOptions'
import type { LinkingSiteType } from 'src/enums/linkingSiteEnum'
import type { SiteType } from 'src/enums/siteEnum'
import { getSite } from 'src/services/siteService'
import type { Ref } from 'vue'
import LinkingDialog from '../components/LinkingDialog.vue'
import type { BaseSite } from 'src/classes/sites/baseSite'
import { getSiteNameByUrl } from 'src/utils/siteUtils'
import type { Observable } from 'rxjs'
import { firstValueFrom } from 'rxjs'
import type { Manga } from 'src/classes/manga'
import { stateManager } from 'src/store/store-reader'

export default function useProgressLinking(
  manga$: Observable<Manga>,
  newLinkedSites: Ref<Record<string, number> | undefined>,
): {
  linkSite: (url: string, siteType: SiteType | LinkingSiteType) => void
  openLinkingDialog: () => Promise<void>
  saveLinkedSites: () => Promise<boolean>
  syncSites: (chapterNum: number) => Promise<void>
} {
  const { notification$, setManga } = stateManager

  const $q = useQuasar()
  const linkSite = (url: string, siteType: SiteType | LinkingSiteType): void => {
    if (url === '') return

    const site = getSite(siteType)
    if (!site) {
      notification$.next(new NotifyOptions('Site not found'))
      return
    }

    const failMessage = 'Failed to get manga from URL'
    site
      .getMangaId($q, url)
      .then((mangaId) => {
        if (mangaId instanceof Error) {
          notification$.next(new NotifyOptions(mangaId, failMessage))
          return
        }
        if (mangaId === -1) {
          notification$.next(new NotifyOptions('No ID found in URL', failMessage))
          return
        }

        const curLinkedSites = newLinkedSites.value ?? {}
        curLinkedSites[siteType] = mangaId

        newLinkedSites.value = curLinkedSites
      })
      .catch((error: Error) => {
        notification$.next(new NotifyOptions(error, failMessage))
      })
  }

  const openLinkingDialog = async (): Promise<void> => {
    const manga = await firstValueFrom(manga$)

    $q.dialog({
      component: LinkingDialog,
      componentProps: {
        linkedSites: newLinkedSites.value ?? manga.linkedSites,
        initialSearch: manga.title,
        searchPlaceholder: 'Search for the manga',
        manualPlaceholder: 'Or enter the url manually',
        confirmButton: 'Select',
      },
    }).onOk((data: { url: string; siteType: SiteType | LinkingSiteType; linkedSites: Record<string, number> }) => {
      newLinkedSites.value = data.linkedSites
      linkSite(data.url, data.siteType)
    })
  }

  const saveLinkedSites = async (): Promise<boolean> => {
    if (newLinkedSites.value === undefined) return false
    const manga = await firstValueFrom(manga$)

    manga.linkedSites = newLinkedSites.value
    setManga({ manga })

    return true
  }

  const syncSites = async (chapterNum: number): Promise<void> => {
    const manga = await firstValueFrom(manga$)

    Object.keys(manga.linkedSites).forEach((key) => {
      const siteType = key as SiteType | LinkingSiteType
      const site = getSite(siteType)
      const mangaId = manga.linkedSites[siteType]

      if (site && mangaId !== undefined) {
        syncSite(site, mangaId, chapterNum)
      }
    })
  }

  const syncSite = (site: BaseSite, mangaId: number, chapterNum: number): void => {
    site
      .syncReadChapter(mangaId, chapterNum)
      .then((result) => {
        if (result instanceof Error) {
          showSyncError(result, site, mangaId, chapterNum)
          return
        }

        const notifyOptions = new NotifyOptions(`Synced with ${getSiteNameByUrl(site.siteType) ?? 'unknown site'}`)
        notifyOptions.type = 'positive'
        notification$.next(notifyOptions)
      })
      .catch((error: Error) => {
        showSyncError(error, site, mangaId, chapterNum)
      })
  }

  const showSyncError = (error: string | Error, site: BaseSite, mangaId: number, chapterNum: number): void => {
    const notifyOptions = new NotifyOptions(
      error,
      `Failed to sync with ${getSiteNameByUrl(site.siteType) ?? 'unknown site'}`,
    )

    notifyOptions.actions = [
      {
        label: 'Relog',
        handler: (): void => {
          site
            .openLogin($q)
            .then((loggedIn) => {
              if (loggedIn instanceof Error) {
                notification$.next(new NotifyOptions(loggedIn, 'Failed to log in'))
                return
              }
              if (!loggedIn) return

              syncSite(site, mangaId, chapterNum)
            })
            .catch((e: Error) => {
              notification$.next(new NotifyOptions(e, 'Failed to log in'))
            })
        },
        color: 'white',
      },
    ]

    notification$.next(notifyOptions)
  }

  return {
    linkSite,
    openLinkingDialog,
    saveLinkedSites,
    syncSites,
  }
}
