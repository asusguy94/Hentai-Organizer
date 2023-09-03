import { useQuery } from 'react-query'

import { createApi } from '@config'
import { StarSearch, VideoSearch } from '@interfaces'

const { baseURL } = createApi('/search')

export default {
  useStars: () => {
    const query = useQuery<StarSearch[]>('stars', async () => {
      const res = await fetch(`${baseURL}/star`)
      return res.json()
    })

    return { data: query.data, isLoading: query.isFetching }
  },
  useVideos: () => {
    const query = useQuery<VideoSearch[]>('videos', async () => {
      const res = await fetch(`${baseURL}/video`)
      return res.json()
    })

    return { data: query.data, isLoading: query.isFetching }
  }
}
