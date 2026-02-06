import type { Ref } from 'vue'
import { nextTick, onMounted, ref, watch } from 'vue'
import WindowSize from '../classes/windowSize'
import { stateManager } from 'src/store/store-reader'

export default function useWindowSize(): { windowSize: Ref<WindowSize> } {
  const windowSize: Ref<WindowSize> = ref(new WindowSize())
  const getWindowSize = (): void => {
    windowSize.value = new WindowSize(window.innerWidth, window.innerHeight)
  }

  onMounted(async () => {
    getWindowSize()
    await nextTick()
    window.addEventListener('resize', getWindowSize)
  })

  return { windowSize }
}

export function useAppWindowSize(): void {
  const { windowSize } = useWindowSize()
  const { mobileView$ } = stateManager

  const getMobileView = (newWindowSize: WindowSize): void => {
    mobileView$.next(newWindowSize.x <= 850)
  }

  onMounted(() => {
    getMobileView(windowSize.value)
  })

  watch(windowSize, getMobileView)
}
