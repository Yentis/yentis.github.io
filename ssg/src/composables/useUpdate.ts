import type { GithubRelease } from '../services/updateService'
import { checkUpdates, getApkAsset, getElectronAsset } from '../services/updateService'
import { NotifyOptions } from '../classes/notifyOptions'
import { UrlNavigation } from '../classes/urlNavigation'
import { getPlatform } from 'src/services/platformService'
import { Platform } from 'src/enums/platformEnum'
import { stateManager } from 'src/store/store-reader'

export default function useUpdate(): { doUpdateCheck: () => void } {
  const { urlNavigation$, notification$ } = stateManager

  const showUpdateAvailable = (githubRelease: GithubRelease): void => {
    const platform = getPlatform()
    if (platform === Platform.Static) return

    const notifyOptions = new NotifyOptions(`Update available: ${githubRelease.tag_name}`)
    notifyOptions.type = 'positive'
    notifyOptions.position = 'bottom'
    notifyOptions.actions = [
      {
        label: 'Download',
        handler: (): void => {
          if (platform === Platform.Capacitor) {
            const apkAsset = getApkAsset(githubRelease)
            if (!apkAsset) return
            window.location.href = apkAsset.browser_download_url
          } else if (platform === Platform.Electron) {
            const electronAsset = getElectronAsset(githubRelease)
            if (!electronAsset) return
            urlNavigation$.next(new UrlNavigation(electronAsset.browser_download_url, false))
          }
        },
        color: 'white',
      },
    ]

    notification$.next(notifyOptions)
  }

  return {
    doUpdateCheck: (): void => {
      checkUpdates()
        .then((result) => {
          if (!result) return
          showUpdateAvailable(result)
        })
        .catch((error: Error) => {
          notification$.next(new NotifyOptions(error, 'Failed to check for updates'))
        })
    },
  }
}
