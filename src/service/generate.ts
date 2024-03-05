import { createApi } from '@config'

const { legacyApi } = createApi('/generate')

export default {
  meta: () => legacyApi.post('/meta').then(res => res.data),
  vtt: () => legacyApi.post('/vtt').then(res => res.data)
}
