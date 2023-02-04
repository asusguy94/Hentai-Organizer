import axios from 'axios'

import { IndexType, IStar, MakeOptional } from '@interfaces'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/search`
})

export default {
  getStars: () => api.get<MakeOptional<IStar, 'hidden'>[]>('/star'),
  getVideos: <T extends IndexType<any>>() => api.get<MakeOptional<T, 'hidden'>[]>('/video')
}
