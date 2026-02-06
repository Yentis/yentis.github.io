import useMangaList from './useMangaList'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { Manga } from '../classes/manga'
import { SiteType } from '../enums/siteEnum'
import { useQuasar } from 'quasar'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'
import useProgressLinking from './useProgressLinking'
import { Status } from 'src/enums/statusEnum'
import useAltSources from './useAltSources'
import { getMangaInfoByUrl, getSite } from 'src/services/siteService'
import { NotifyOptions } from 'src/classes/notifyOptions'
import usePushNotification from './usePushNotification'
import { isMangaRead } from 'src/services/sortService'
import type { LinkingSiteType } from 'src/enums/linkingSiteEnum'
import { stateManager } from 'src/store/store-reader'
import type { Observable } from 'rxjs'
import { BehaviorSubject, combineLatest, firstValueFrom, switchMap, tap } from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'

function useManga(_curUrl: string): {
  observable: Observable<Manga>
  setUrl: (newUrl: string) => Promise<void>
  image: Ref<string, string>
  setMangaRead: (read: string) => void
  showDeleteMangaDialog: () => Promise<boolean>
} {
  const { clearPushNotification } = usePushNotification()
  const { notification$, mangaMap$, setManga } = stateManager
  const curUrl$ = new BehaviorSubject(_curUrl)

  let mangaValue = mangaMap$.value.get(_curUrl) ?? new Manga(_curUrl, SiteType.AsuraScans)
  const manga$ = combineLatest([mangaMap$, curUrl$]).pipe(
    switchMap(async ([curMap, url]) => {
      const curMangaValue = curMap.get(url)
      if (curMangaValue) return curMangaValue

      const newMangaValue = await getMangaInfoByUrl(url)
      if (newMangaValue instanceof Manga) return newMangaValue

      return new Manga(url, SiteType.AsuraScans)
    }),
    tap((manga) => (mangaValue = manga)),
  )

  const setUrl = async (newUrl: string): Promise<void> => {
    const result = await getMangaInfoByUrl(newUrl)
    if (result instanceof Error) {
      notification$.next(new NotifyOptions(result, 'Failed to update URL'))
      return
    }

    const curManga = Object.assign({}, mangaValue)
    const newManga = Manga.inherit(curManga, result)

    setManga({ url: curUrl$.value, manga: newManga })
    curUrl$.next(newUrl)
  }

  const setMangaRead = (read: string): void => {
    mangaValue.read = read
    setManga({ manga: mangaValue })

    if (isMangaRead(mangaValue)) {
      clearPushNotification(curUrl$.value)
    }
  }

  const image = ref('')

  const readImage = async (siteType: SiteType | LinkingSiteType, imageUrl: string): Promise<string> => {
    const site = getSite(siteType)
    return (await site?.readImage(imageUrl)) ?? imageUrl
  }

  useSubscription(
    manga$.subscribe((manga) => {
      readImage(manga.site, manga.image)
        .then((data) => {
          image.value = data
        })
        .catch(console.error)
    }),
  )

  const $q = useQuasar()
  const showDeleteMangaDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: 'Delete manga',
          content: `Are you sure you want to delete ${mangaValue.title}?`,
          imageUrl: image.value,
        },
      })
        .onOk(() => {
          resolve(true)
        })
        .onCancel(() => {
          resolve(false)
        })
    })
  }

  return {
    observable: manga$,
    image,
    setUrl,
    setMangaRead,
    showDeleteMangaDialog,
  }
}

export function useMangaItem(url: string): ReturnType<typeof useManga> & {
  deleteManga: () => Promise<void>
  readManga: () => Promise<void>
  toggleEditing: () => Promise<void>
  editing: Ref<boolean, boolean>
  saving: Ref<boolean, boolean>
  newUrl: Ref<string, string>
  newReadNum: Ref<number | undefined, number | undefined>
  newStatus: Ref<Status, Status>
  newNotes: Ref<string, string>
  newShouldUpdate: Ref<boolean, boolean>
  newRating: Ref<number, number>
  newLinkedSites: Ref<Record<string, number> | undefined, Record<string, number> | undefined>
  newSources: Ref<Record<string, string> | undefined, Record<string, string> | undefined>
  saveManga: () => Promise<void>
} {
  const newLinkedSites: Ref<Record<string, number> | undefined> = ref()
  const newSources: Ref<Record<string, string> | undefined> = ref()

  const manga = useManga(url)
  const { storeManga } = useMangaList()
  const { syncSites, saveLinkedSites } = useProgressLinking(manga.observable, newLinkedSites)
  const { saveSources } = useAltSources(manga.observable, newSources)
  const { setManga, removeManga } = stateManager

  const deleteManga = async (): Promise<void> => {
    const confirmed = await manga.showDeleteMangaDialog()
    if (!confirmed) return

    removeManga(url)
    storeManga()
  }

  const readManga = async (): Promise<void> => {
    const curManga = await firstValueFrom(manga.observable)

    curManga.read = curManga.chapter
    curManga.readUrl = curManga.chapterUrl
    curManga.readNum = curManga.chapterNum

    setManga({ manga: curManga })
    await syncSites(curManga.chapterNum)
    storeManga()
  }

  const editing = ref(false)
  const saving = ref(false)

  const saveManga = async (): Promise<void> => {
    saving.value = true

    let urlChanged = false
    try {
      urlChanged = await saveUrl()
    } finally {
      saving.value = false
    }

    const readNumChanged = await saveReadNum()
    const statusChanged = await saveStatus()
    const notesChanged = await saveNotes()
    const shouldUpdateChanged = await saveShouldUpdate()
    const ratingChanged = await saveRating()
    const linkedSitesChanged = await saveLinkedSites()
    const sourcesChanged = await saveSources()

    editing.value = !editing.value

    if (
      !urlChanged &&
      !readNumChanged &&
      !statusChanged &&
      !linkedSitesChanged &&
      !notesChanged &&
      !ratingChanged &&
      !sourcesChanged &&
      !shouldUpdateChanged
    ) {
      return
    }

    storeManga()
  }

  const newUrl = ref('')
  const newReadNum: Ref<number | undefined> = ref(-1)
  const newStatus = ref(Status.READING)
  const newNotes = ref('')
  const newShouldUpdate = ref(false)
  const newRating = ref(0)

  const toggleEditing = async (): Promise<void> => {
    const curManga = await firstValueFrom(manga.observable)

    editing.value = !editing.value
    newUrl.value = curManga.url
    newReadNum.value = curManga.readNum
    newStatus.value = curManga.status
    newNotes.value = curManga.notes ?? ''
    newShouldUpdate.value = curManga.shouldUpdate ?? false
    newRating.value = curManga.rating ?? 0
    newLinkedSites.value = undefined
    newSources.value = undefined
  }

  const saveUrl = async (): Promise<boolean> => {
    const curManga = await firstValueFrom(manga.observable)
    const currentUrl = curManga.url ?? ''
    if (newUrl.value === currentUrl) return false

    await manga.setUrl(newUrl.value)
    return true
  }

  const saveReadNum = async (): Promise<boolean> => {
    if (typeof newReadNum.value === 'number' || newReadNum.value === undefined || newReadNum.value === -1) return false
    const parsedReadNum = parseFloat(newReadNum.value)

    const curManga = await firstValueFrom(manga.observable)
    if (isNaN(parsedReadNum) || parsedReadNum === curManga.readNum) return false

    const isEqualToCurrent = parsedReadNum === curManga.chapterNum
    curManga.read = isEqualToCurrent ? curManga.chapter : newReadNum.value
    curManga.readUrl = isEqualToCurrent ? curManga.chapterUrl : undefined
    curManga.readNum = parsedReadNum
    setManga({ manga: curManga })

    await syncSites(curManga.readNum)
    return true
  }

  const saveStatus = async (): Promise<boolean> => {
    const curManga = await firstValueFrom(manga.observable)
    if (newStatus.value === curManga.status) return false

    curManga.status = newStatus.value
    setManga({ manga: curManga })

    return true
  }

  const saveNotes = async (): Promise<boolean> => {
    const curManga = await firstValueFrom(manga.observable)
    const currentNotes = curManga.notes ?? ''
    if (newNotes.value === currentNotes) return false

    curManga.notes = newNotes.value
    setManga({ manga: curManga })

    return true
  }

  const saveShouldUpdate = async (): Promise<boolean> => {
    const curManga = await firstValueFrom(manga.observable)
    const currentShouldUpdate = curManga.shouldUpdate ?? false
    if (newShouldUpdate.value === currentShouldUpdate) return false

    curManga.shouldUpdate = newShouldUpdate.value
    setManga({ manga: curManga })

    return true
  }

  const saveRating = async (): Promise<boolean> => {
    const curManga = await firstValueFrom(manga.observable)
    const currentRating = curManga.rating ?? 0
    if (newRating.value === currentRating) return false

    curManga.rating = newRating.value
    setManga({ manga: curManga })

    return true
  }

  return {
    ...manga,
    deleteManga,
    readManga,
    toggleEditing,
    editing,
    saving,
    newUrl,
    newReadNum,
    newStatus,
    newNotes,
    newShouldUpdate,
    newRating,
    newLinkedSites,
    newSources,
    saveManga,
  }
}
