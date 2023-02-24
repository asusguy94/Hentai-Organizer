import axios from 'axios'

import { Bookmark, Video, VideoStar } from '@interfaces'
import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/video`
})

export default {
  get: (id: number) => api.get<Video>(`/${id}`),
  getStars: (id: number) => api.get<VideoStar[]>(`/${id}/star`),
  getBookmarks: (id: number) => api.get<Bookmark[]>(`/${id}/bookmark`)
}
