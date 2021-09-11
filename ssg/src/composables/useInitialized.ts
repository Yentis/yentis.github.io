import { useStore } from '../store/index'
import { computed, onMounted, watch } from 'vue'
import useSharing from './useSharing'

export default function useInitialized () {
  const $store = useStore()

  const main = computed({
    get: () => $store.state.initialized.main,
    set: (val) => $store.commit('initialized/updateMain', val)
  })
  const siteState = computed({
    get: () => $store.state.initialized.siteState,
    set: (val) => $store.commit('initialized/updateSiteState', val)
  })
  const clearInitialized = () => {
    main.value = false
    siteState.value = false
  }

  return { main, siteState, clearInitialized }
}

export function useAppInitialized () {
  const { main, clearInitialized } = useInitialized()
  const { startShareSyncInterval } = useSharing()

  onMounted(clearInitialized)

  const initialize = () => {
    startShareSyncInterval()
  }

  const checkInitialize = () => {
    if (main.value) return
    initialize()
    main.value = true
  }

  onMounted(checkInitialize)
  watch(main, checkInitialize)
}
