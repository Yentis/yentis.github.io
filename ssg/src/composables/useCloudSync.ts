import { useQuasar } from 'quasar'
import { NotifyOptions } from 'src/classes/notifyOptions'
import { UrlNavigation } from 'src/classes/urlNavigation'
import { DropboxResponseError, getAuth, getAuthUrl, readList, saveList } from 'src/services/dropboxService'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'
import useMangaList from './useMangaList'
import type { ReadListResponse } from '../services/dropboxService'
import { setEditCode, setShareId } from 'src/services/rentryService'
import { stateManager } from 'src/store/store-reader'

export default function useCloudSync(): {
  importList: () => Promise<void>
  exportList: () => Promise<void>
} {
  const $q = useQuasar()
  const { storeManga } = useMangaList()
  const { urlNavigation$, notification$, getMangaList, setMangaList } = stateManager

  const openDropboxLogin = (): void => {
    getAuthUrl()
      .then((authUrl) => {
        urlNavigation$.next(new UrlNavigation(authUrl, true))
      })
      .catch((error: Error) => {
        notification$.next(new NotifyOptions(error, 'Failed to get auth url'))
      })
  }

  const importList = async (): Promise<void> => {
    if (!getAuth()) {
      openDropboxLogin()
      return
    }

    let readListResponse: ReadListResponse
    try {
      readListResponse = await readList()
    } catch (error: unknown) {
      if (error instanceof DropboxResponseError) {
        if (error.status === 401 || error.status === 400) {
          openDropboxLogin()
          return
        }

        notification$.next(new NotifyOptions(`${error.status}: ${JSON.stringify(error)}`))
      } else if (error instanceof Error) {
        notification$.next(new NotifyOptions(error))
      } else {
        notification$.next(new NotifyOptions(error as string))
      }
    }

    return new Promise<void>((resolve) => {
      const { mangaList: storedMangaList, shareContents } = readListResponse

      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: 'Import from Dropbox',
          content: `Are you sure you want to import ${storedMangaList.length} titles from Dropbox?\nYou currently have ${getMangaList().length} titles.`,
        },
      })
        .onOk(() => {
          const notifyOptions = new NotifyOptions('Imported!')
          notifyOptions.type = 'positive'
          notification$.next(notifyOptions)

          setMangaList(storedMangaList)
          storeManga()

          if (!shareContents) {
            resolve()
            return
          }

          setShareId(shareContents.id)
          setEditCode(shareContents.editCode)

          resolve()
        })
        .onCancel(() => {
          resolve()
        })
    })
  }

  const exportList = async (): Promise<void> => {
    if (!getAuth()) {
      openDropboxLogin()
      return
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: 'Export to Dropbox',
          content: `Are you sure you want to export ${getMangaList().length} titles to Dropbox?`,
        },
      })
        .onOk(() => {
          resolve(true)
        })
        .onCancel(() => {
          resolve(false)
        })
    })

    if (!confirmed) return

    try {
      await saveList(getMangaList())

      const notifyOptions = new NotifyOptions('Exported!')
      notifyOptions.type = 'positive'
      notification$.next(notifyOptions)
    } catch (error: unknown) {
      if (error instanceof DropboxResponseError) {
        if (error.status === 401 || error.status === 400) {
          openDropboxLogin()
          return
        }

        notification$.next(new NotifyOptions(`${error.status}: ${JSON.stringify(error)}`))
      } else if (error instanceof Error) {
        notification$.next(new NotifyOptions(error))
      } else {
        notification$.next(new NotifyOptions(error as string))
      }
    }
  }

  return { importList, exportList }
}
