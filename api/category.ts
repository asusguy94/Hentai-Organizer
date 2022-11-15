import axios from 'axios'

import { serverConfig } from '@config'
import { ICategory } from '@interfaces'

const api = axios.create({
  baseURL: `${serverConfig.api}/category`
})

export default {
  getAll: async () => api.get<ICategory[]>('/')
}
