/// <reference types="cordova-plugin-inappbrowser" />

import { openURL } from 'quasar'
import { useAuth, useCapacitorAuth } from './useAuthCallback'
import type ElectronWindow from 'src/interfaces/electronWindow'
import { checkSites } from 'src/services/siteService'
import { getPlatform } from 'src/services/platformService'
import { Platform } from 'src/enums/platformEnum'
import { stateManager } from 'src/store/store-reader'
import { useSubscription } from '@vueuse/rxjs'

export function useAppUrlNavigation(): void {
  const { onDropboxRedirect } = useAuth()
  const platform = getPlatform()

  const openInApp = (url: string, forced: boolean): void => {
    if (platform !== Platform.Capacitor) {
      window.location.href = url
      return
    }

    const { onUrlLoadStart } = useCapacitorAuth()
    const browser = cordova.InAppBrowser.open(url, '_blank')
    if (!forced) return

    browser.addEventListener('exit', () => {
      checkSites()
    })

    browser.addEventListener('loadstart', (event) => {
      const queryString = onUrlLoadStart(event.url)
      if (queryString === null) return

      browser.close()
      onDropboxRedirect(queryString)
    })
  }

  const { urlNavigation$, settings$ } = stateManager

  useSubscription(
    urlNavigation$.subscribe((urlNavigation) => {
      if (!urlNavigation) return
      if (platform === Platform.Static) {
        openURL(urlNavigation.url)
        return
      }

      const openInBrowser = settings$.value.openInBrowser

      if (urlNavigation.openInApp || !openInBrowser) {
        openInApp(urlNavigation.url, urlNavigation.openInApp)
      } else if (platform === Platform.Capacitor) {
        window.location.href = urlNavigation.url
      } else if (platform === Platform.Electron) {
        const electronWindow = window as unknown as ElectronWindow
        electronWindow.mangaReader.openURL(urlNavigation.url)
      }
    }),
  )
}
