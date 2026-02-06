import { onMounted } from 'vue'
import useSharing from './useSharing'
import { getChangelog } from '../services/updateService'
import { LocalStorage, useQuasar } from 'quasar'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'
import constants from 'src/classes/constants'
import jsonPackage from '../../package.json'
import { useElectronAuth, useStaticAuth } from './useAuthCallback'
import { hasExtension } from 'src/classes/requests/browserRequest'
import useUpdate from './useUpdate'
import { stateManager } from 'src/store/store-reader'
import { useSubscription } from '@vueuse/rxjs'
import { debounceTime } from 'rxjs'

export function useAppInitialized(): void {
  const $q = useQuasar()
  const { doUpdateCheck } = useUpdate()
  const { startShareSyncInterval } = useSharing()
  const { init$, siteListFetched$ } = stateManager

  onMounted(() => init$.next())

  const initialize = async (): Promise<void> => {
    doUpdateCheck()

    const changelog = await getChangelog()
    if (changelog) {
      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: 'Changelog',
          content: changelog,
          hideCancel: true,
        },
      }).onDismiss(() => {
        LocalStorage.set(constants.MIGRATION_VERSION, jsonPackage.version)
      })
    }

    startShareSyncInterval()
  }

  useSubscription(
    init$.pipe(debounceTime(500)).subscribe(() => {
      siteListFetched$.next(false)
      initialize().catch(console.error)
    }),
  )
}

export function useCapacitorInitialized(): void {
  const { init$ } = stateManager

  onMounted(() => {
    document.addEventListener('resume', () => {
      init$.next()
    })
  })
}

export function useElectronInitialized(): void {
  useElectronAuth()
}

export function useStaticInitialized(): void {
  const $q = useQuasar()

  useStaticAuth()
  hasExtension()
    .then((exists) => {
      if (exists) return

      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: 'Extension missing or outdated',
          content: `To use this page it is required you download the latest Manga Reader chrome extension version

        After downloading:
        Open the extensions page
        Enable developer mode
        Extract the downloaded extension and select it with "Load unpacked"

        `,
          link: 'https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2FYentis%2Fmanga-reader%2Ftree%2Fmaster%2Fsrc-extension',
          linkText: 'Download here',
          hideCancel: true,
        },
      })
    })
    .catch((error) => console.error(error))
}
