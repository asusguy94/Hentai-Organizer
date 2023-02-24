import axios from 'axios'

import { serverConfig } from '@config'
import { Attribute } from '@interfaces'

const api = axios.create({
  baseURL: `${serverConfig.api}/attribute`
})

export default {
  getAll: <T extends Attribute>() => api.get<T[]>('/'),
  getVideos: () => api.get<Attribute[]>('/video')
}
