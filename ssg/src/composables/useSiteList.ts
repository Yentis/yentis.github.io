import type { BaseSite } from '../classes/sites/baseSite'
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import { getSiteMap } from '../services/siteService'
import { stateManager } from 'src/store/store-reader'

interface DisplayedSite {
  site: BaseSite
  refreshing: boolean
}

function siteSort(a: DisplayedSite, b: DisplayedSite): number {
  return a.site.compare(b.site)
}

export default function useSiteList(): {
  siteList: Ref<DisplayedSite[]>
  refreshing: Ref<boolean, boolean>
  refreshSites: () => void
} {
  const { siteListFetched$ } = stateManager
  const refreshing = ref(false)
  const siteList: Ref<DisplayedSite[]> = ref([])

  const getSiteList = (): void => {
    siteList.value = Array.from(getSiteMap().values())
      .map((site) => {
        return {
          site,
          refreshing: false,
        }
      })
      .sort(siteSort)
  }

  onMounted(getSiteList)

  const refreshSites = (): void => {
    refreshing.value = true
    siteList.value.forEach((site) => {
      site.refreshing = true
    })

    const promises: Promise<void>[] = []

    getSiteMap().forEach((site) => {
      const promise = site.checkState().then(() => {
        const siteItem = siteList.value.find((item) => item.site.siteType === site.siteType)
        if (!siteItem) return

        siteItem.site = site
        siteItem.refreshing = false
      })
      promises.push(promise)
    })

    Promise.all(promises)
      .catch((error) => console.error(error))
      .finally(() => {
        refreshing.value = false
        siteList.value.sort(siteSort)
      })
  }

  onMounted(() => {
    if (siteListFetched$.value) return
    refreshSites()
    siteListFetched$.next(true)
  })

  return { siteList, refreshing, refreshSites }
}
