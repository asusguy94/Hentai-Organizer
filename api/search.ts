import axios from 'axios'

import { IndexType, IStar, MakeOptional } from '@interfaces'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/search`
})

export default {
  getStars: async () => await api.get<MakeOptional<IStar, 'hidden'>[]>('/star'),
  getVideos: async <T extends IndexType>() => await api.get<MakeOptional<T, 'hidden'>[]>('/video')
}
