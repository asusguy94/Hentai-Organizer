import axios from 'axios'

import { serverConfig } from '@config'
import { IAttribute } from '@interfaces'

const api = axios.create({
  baseURL: `${serverConfig.api}/attribute`
})

export default {
  getAll: <T extends IAttribute>() => api.get<T[]>('/'),
  getVideos: () => api.get<IAttribute[]>('/video')
}
