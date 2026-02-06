import type { Manga } from '../classes/manga'
import { UrlNavigation } from '../classes/urlNavigation'
import { getPlatform } from 'src/services/platformService'
import { Platform } from 'src/enums/platformEnum'
import { LocalNotifications } from '@capacitor/local-notifications'
import { stateManager } from 'src/store/store-reader'
import { useSubscription } from '@vueuse/rxjs'

export default function usePushNotification(): {
  sendPushNotification: (manga: Manga) => void
  clearPushNotification: (url: string) => void
  removePushNotificationById: (id: number) => void
} {
  const { urlNavigation$, pushNotifications$, addPushNotification, removePushNotification } = stateManager

  const sendPushNotification = (manga: Manga): void => {
    const randomNum = Math.random().toString()
    // Substring first 9 chars to stay under Java max int
    const id = parseInt(randomNum.substring(randomNum.indexOf('.') + 1).substring(0, 9))

    if (getPlatform() === Platform.Capacitor) {
      LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: manga.title,
            smallIcon: 'notification_icon',
            // TODO: Patched https://github.com/ionic-team/capacitor-plugins/issues/430
            largeIcon: manga.image,
            body: manga.chapter,
          },
        ],
      }).catch(console.error)
    } else {
      const notification = new Notification(manga.title, {
        body: manga.chapter,
        icon: manga.image,
      })

      notification.onclick = (): void => {
        urlNavigation$.next(new UrlNavigation(manga.url, false))
      }
    }

    addPushNotification({ url: manga.url, id })
  }

  const clearPushNotification = (url: string): void => {
    const id = pushNotifications$.value.get(url)
    if (id === undefined) return

    if (getPlatform() === Platform.Capacitor) {
      LocalNotifications.cancel({ notifications: [{ id }] }).catch(console.error)
    }

    removePushNotification(url)
  }

  const removePushNotificationById = (id: number): void => {
    for (const [url, curId] of pushNotifications$.value) {
      if (curId === id) {
        removePushNotification(url)
        break
      }
    }
  }

  return {
    sendPushNotification,
    clearPushNotification,
    removePushNotificationById,
  }
}

export function useAppPushNotification(): void {
  const { clearPushNotification, removePushNotificationById } = usePushNotification()
  const { mangaMap$, settings$, pushNotifications$ } = stateManager

  if (getPlatform() === Platform.Capacitor) {
    LocalNotifications.addListener('localNotificationActionPerformed', (actionPerformed) => {
      removePushNotificationById(actionPerformed.notification.id)
    }).catch(console.error)
  }

  useSubscription(
    settings$.subscribe((newSettings) => {
      if (getPlatform() !== Platform.Static) return
      if (!newSettings.refreshOptions.enabled) return
      if (Notification.permission === 'denied') return

      Notification.requestPermission().catch((error) => console.error(error))
    }),
  )

  useSubscription(
    mangaMap$.subscribe((mangaMap) => {
      pushNotifications$.value.forEach((_, url) => {
        if (!mangaMap.get(url)) {
          clearPushNotification(url)
        }
      })
    }),
  )
}
