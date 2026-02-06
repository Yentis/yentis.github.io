import type { Ref } from 'vue'
import { onMounted, ref, watch } from 'vue'
import useWindowSize from './useWindowSize'
import { stateManager } from 'src/store/store-reader'

export default function useSiteListVisible(): {
  visible: Ref<boolean, boolean>
} {
  const { windowSize } = useWindowSize()
  const { mobileView$ } = stateManager

  const visible = ref(true)
  const getVisible = (): void => {
    if (windowSize.value.x <= 700 && !mobileView$.value) visible.value = false
    else visible.value = !(windowSize.value.y <= 500 && mobileView$.value)
  }

  onMounted(getVisible)
  watch(windowSize, getVisible)

  return { visible }
}
