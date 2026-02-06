import { useQuasar } from 'quasar'
import type { Ref } from 'vue'
import AltSourceDialog from '../components/AltSourceDialog.vue'
import type { Observable } from 'rxjs'
import { firstValueFrom } from 'rxjs'
import type { Manga } from 'src/classes/manga'
import { stateManager } from 'src/store/store-reader'

export default function useAltSources(
  manga$: Observable<Manga>,
  newSources: Ref<Record<string, string> | undefined>,
): {
  saveSources: () => Promise<boolean>
  openAltSourceDialog: () => Promise<void>
} {
  const $q = useQuasar()
  const { setManga } = stateManager

  const openAltSourceDialog = async (): Promise<void> => {
    const manga = await firstValueFrom(manga$)

    $q.dialog({
      component: AltSourceDialog,
      componentProps: {
        sources: newSources.value ?? manga.altSources ?? {},
        initialSearch: manga.title,
        searchPlaceholder: 'Search for a manga',
        manualPlaceholder: 'Or enter the url manually',
        confirmButton: 'Confirm',
      },
    }).onOk((sources: Record<string, string>) => {
      newSources.value = sources
    })
  }

  const saveSources = async (): Promise<boolean> => {
    if (newSources.value === undefined) return false
    const manga = await firstValueFrom(manga$)

    manga.altSources = newSources.value
    setManga({ manga })

    return true
  }

  return { saveSources, openAltSourceDialog }
}
