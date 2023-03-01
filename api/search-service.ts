import { useFetch } from 'usehooks-ts'

import { StarSearch, VideoSearch } from '@components/search/helper'

import { serverConfig } from '@config'

const baseURL = `${serverConfig.api}/search`

export default {
  useStars: () => useFetch<StarSearch[]>(`${baseURL}/star`),
  useVideos: () => useFetch<VideoSearch[]>(`${baseURL}/video`)
}
