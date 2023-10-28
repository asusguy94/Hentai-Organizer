import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { StarSearch, VideoSearch } from '@interfaces'

const { baseURL } = createApi('/search')

export default {
  useStars: () => {
    const query = useQuery<StarSearch[]>({
      queryKey: ['search', 'stars'],
      queryFn: async () => {
        const res = await fetch(`${baseURL}/star`)
        return res.json()
      },
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  },
  useVideos: () => {
    const query = useQuery<VideoSearch[]>({
      queryKey: ['search', 'videos'],
      queryFn: async () => {
        const res = await fetch(`${baseURL}/video`)
        return res.json()
      },
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  }
}
