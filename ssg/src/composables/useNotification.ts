import { useQuasar } from 'quasar'
import { NotifyOptions } from 'src/classes/notifyOptions'
import ErrorDialog from '../components/ErrorDialog.vue'
import { stateManager } from 'src/store/store-reader'
import { useSubscription } from '@vueuse/rxjs'

export function useAppNotification(): void {
  const $q = useQuasar()
  const { notification$, errors$, addError } = stateManager

  let dismissErrorNotification: (() => void) | undefined
  let errorDialogShowing = false

  useSubscription(
    notification$.subscribe((notification) => {
      if (!notification) return

      if (notification.type !== 'negative') {
        $q.notify(notification.getOptions())
        return
      }

      addError(notification)
      console.error(notification.message)
      if (errorDialogShowing) return

      if (errors$.value.length <= 0) {
        dismissErrorNotification = $q.notify({
          ...notification.getOptions(),
          onDismiss: () => {
            if (errors$.value.length > 1) return
            errors$.next([])
          },
        }) as () => void
        return
      }

      if (dismissErrorNotification) dismissErrorNotification()
      let dismiss: (() => void) | undefined

      const notifyOptions = new NotifyOptions('Issues detected')
      notifyOptions.position = 'bottom-right'
      notifyOptions.timeout = 0
      notifyOptions.actions = [
        {
          label: 'View',
          handler: (): void => {
            errorDialogShowing = true

            $q.dialog({
              component: ErrorDialog,
            }).onDismiss(() => {
              errors$.next([])
              errorDialogShowing = false
            })
          },
          color: 'white',
        },
        {
          label: 'Close',
          handler: (): void => {
            if (!dismiss) return
            dismiss()
            dismiss = undefined
            errors$.next([])
          },
          color: 'white',
        },
      ]

      dismiss = $q.notify(notifyOptions.getOptions())
    }),
  )
}
