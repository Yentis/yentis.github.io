import { NotifyOptions } from 'src/classes/notifyOptions'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useNotification from './useNotification'
import qs from 'qs'
import { setAccessToken as setDropboxAccessToken } from '../services/dropboxService'

function useAuth () {
  const { notification } = useNotification()

  const onDropboxRedirect = (accessToken?: string) => {
    const notifyOptions = new NotifyOptions('Logged in successfully! Please import / export again')
    notifyOptions.type = 'positive'
    notification.value = notifyOptions

    setDropboxAccessToken(accessToken)
  }

  return {
    onDropboxRedirect
  }
}

export function useStaticAuth () {
  const { onDropboxRedirect } = useAuth()

  onMounted(() => {
    const $route = useRoute()
    const fullPath = $route.fullPath

    if (fullPath.startsWith('/redirect#')) {
      const queryString = qs.parse(fullPath.replace('/redirect#', ''))
      const token = queryString.access_token as string
      onDropboxRedirect(token)
    }
  })
}
