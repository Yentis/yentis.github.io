import { onMounted } from 'vue'
import { stateManager } from 'src/store/store-reader'

export function useClearingSearchResults(): { clearSearchResults: () => void } {
  const clearSearchResults = (): void => {
    stateManager.searchResults$.next([])
  }

  onMounted(clearSearchResults)

  return { clearSearchResults }
}
