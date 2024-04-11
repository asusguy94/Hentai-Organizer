import { createApi } from '@/config'

const { legacyApi } = createApi('/generate')

export default {
  meta: () => legacyApi.post('/meta'),
  vtt: () => legacyApi.post('/vtt')
}
