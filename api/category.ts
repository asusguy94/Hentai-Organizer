import axios from 'axios'

import { serverConfig } from '@config'
import { Category } from '@interfaces'

const api = axios.create({
  baseURL: `${serverConfig.api}/category`
})

export default {
  getAll: () => api.get<Category[]>('/')
}
