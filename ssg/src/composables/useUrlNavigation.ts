/// <reference types="cordova-plugin-inappbrowser" />

import { useStore } from '../store/index'
import { computed, watch } from 'vue'
import { UrlNavigation } from '../classes/urlNavigation'
import { openURL } from 'quasar'
import useSettings from './useSettings'

export default function useUrlNavigation () {
  const $store = useStore()
  const urlNavigation = computed({
    get: () => $store.state.reader.urlNavigation,
    set: (val) => $store.commit('reader/pushUrlNavigation', val)
  })

  const navigate = (url: string, openInApp = false) => {
    urlNavigation.value = new UrlNavigation(url, openInApp)
  }

  return { urlNavigation, navigate }
}

export function useAppUrlNavigation () {
  const { urlNavigation } = useUrlNavigation()
  const { settings } = useSettings()

  watch(urlNavigation, (target) => {
    if (!target) return
    const openInBrowser = settings.value.openInBrowser

    if (target.openInApp || !openInBrowser) {
      window.location.href = target.url
    } else {
      openURL(target.url)
    }
  })
}
