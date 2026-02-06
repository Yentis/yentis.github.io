import { onMounted } from 'vue'
import { Settings } from '../classes/settings'
import { LocalStorage, useQuasar } from 'quasar'
import { tryMigrateSettings } from '../services/migrationService'
import SettingsDialog from '../components/SettingsDialog.vue'
import type { SortType } from 'src/enums/sortingEnum'
import type { Status } from 'src/enums/statusEnum'
import constants from 'src/classes/constants'
import { stateManager } from 'src/store/store-reader'
import { pairwise } from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'

export default function useSettings(): {
  showSettingsDialog: () => void
  toggleDarkMode: () => void
  setSortedBy: (sortType: SortType) => void
  setFilters: (filters: Status[]) => void
} {
  const $q = useQuasar()
  const showSettingsDialog = (): void => {
    $q.dialog({
      component: SettingsDialog,
    })
  }

  const { settings$ } = stateManager

  const toggleDarkMode = (): void => {
    const newSettings = Settings.clone(settings$.value)
    newSettings.darkMode = !newSettings.darkMode

    settings$.next(newSettings)
  }

  const setSortedBy = (sortType: SortType): void => {
    const newSettings = Settings.clone(settings$.value)
    newSettings.sortedBy = sortType

    settings$.next(newSettings)
  }

  const setFilters = (filters: Status[]): void => {
    const newSettings = Settings.clone(settings$.value)
    newSettings.filters = filters

    settings$.next(newSettings)
  }

  return {
    showSettingsDialog,
    toggleDarkMode,
    setSortedBy,
    setFilters,
  }
}

export function useAppSettings(): void {
  const $q = useQuasar()
  const { settings$ } = stateManager

  onMounted(() => {
    tryMigrateSettings()
    settings$.next(LocalStorage.getItem(constants.SETTINGS) ?? new Settings())
  })

  const applySettings = (newSettings: Settings): void => {
    if (newSettings.darkMode !== $q.dark.isActive) {
      $q.dark.set(newSettings.darkMode)
    }
  }
  applySettings(settings$.value)

  useSubscription(
    settings$.pipe(pairwise()).subscribe(([oldSettings, newSettings]) => {
      newSettings = Settings.clone(newSettings)
      if (newSettings.equals(oldSettings)) return

      applySettings(newSettings)
      LocalStorage.set(constants.SETTINGS, newSettings)
    }),
  )
}
