import { createApi } from '@config'

const { api } = createApi('/generate')

export default {
  meta: () => api.post('/meta').then(res => res.data),
  vtt: () => api.post('/vtt').then(res => res.data)
}
