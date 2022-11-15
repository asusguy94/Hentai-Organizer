import axios from 'axios'

import { IBookmark, IVideo, IVideoStar } from '@interfaces'
import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/video`
})

export default {
  get: async (id: number) => await api.get<IVideo>(`/${id}`),
  getStars: async (id: number) => await api.get<IVideoStar[]>(`/${id}/star`),
  getBookmarks: async (id: number) => await api.get<IBookmark[]>(`/${id}/bookmark`)
}
