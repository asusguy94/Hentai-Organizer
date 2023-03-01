import axios from 'axios'

import { serverConfig } from '@config'

const baseURL = `${serverConfig.api}/generate`
const api = axios.create({ baseURL })

export default {
  meta: () => api.post('/meta'),
  vtt: () => api.post('/vtt')
}
