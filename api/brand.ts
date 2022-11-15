import axios from 'axios'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/brand`
})

export default {
  getAll: async () => api.get<string[]>('/')
}
