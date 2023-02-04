import axios from 'axios'

import { IBookmark, IVideo, IVideoStar } from '@interfaces'
import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/video`
})

export default {
  get: (id: number) => api.get<IVideo>(`/${id}`),
  getStars: (id: number) => api.get<IVideoStar[]>(`/${id}/star`),
  getBookmarks: (id: number) => api.get<IBookmark[]>(`/${id}/bookmark`)
}
