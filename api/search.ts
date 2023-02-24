import axios from 'axios'

import type { StarSearch, VideoSearch } from '@components/search/helper'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/search`
})

export default {
  getStars: () => api.get<StarSearch[]>('/star'),
  getVideos: () => api.get<VideoSearch[]>('/video')
}
