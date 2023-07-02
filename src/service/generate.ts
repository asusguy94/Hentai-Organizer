import { createApi } from '@config'

const { api } = createApi('/generate')

export default {
  meta: () => api.post('/meta'),
  vtt: () => api.post('/vtt')
}
