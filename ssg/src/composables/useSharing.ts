import { createList, getNotifyOptions, updateList } from '../services/rentryService'
import { useQuasar } from 'quasar'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'
import type { NotifyOptions } from 'src/classes/notifyOptions'
import { stateManager } from 'src/store/store-reader'

export default function useSharing(): {
  startShareSyncInterval: () => void
  showShareDialog: () => Promise<string>
} {
  const $q = useQuasar()
  const { urlNavigation$, notification$, getMangaList } = stateManager

  const getRentryNotifyOptions = (error: unknown): NotifyOptions => {
    return getNotifyOptions(error, urlNavigation$)
  }

  const updateShareList = (): void => {
    updateList(JSON.stringify(getMangaList())).catch((error) => {
      notification$.next(getRentryNotifyOptions(error))
      console.error(error)
    })
  }

  let shareSyncInterval: ReturnType<typeof setInterval> | undefined
  const startShareSyncInterval = (): void => {
    if (shareSyncInterval !== undefined) {
      clearInterval(shareSyncInterval)
      shareSyncInterval = undefined
    }

    updateShareList()
    shareSyncInterval = setInterval(
      () => {
        updateShareList()
      },
      5 * 60 * 1000,
    )
  }

  const showShareDialog = (): Promise<string> => {
    return new Promise((resolve) => {
      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: 'List sharing',
          content:
            'Your list will be uploaded to Rentry and a shareable URL will be generated.\nThis shareable list will be updated periodically and whenever the app is opened.',
        },
      })
        .onOk(() => {
          createList(JSON.stringify(getMangaList()))
            .then((shareId) => {
              resolve(shareId)
            })
            .catch((error) => {
              notification$.next(getRentryNotifyOptions(error))
              console.error(error)
              resolve('')
            })
        })
        .onCancel(() => {
          resolve('')
        })
    })
  }

  return { startShareSyncInterval, showShareDialog }
}
