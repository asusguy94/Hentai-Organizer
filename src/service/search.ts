import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { StarSearch, VideoSearch } from '@interfaces'

const { api } = createApi('/search')

export default {
  useStars: () => {
    const query = useQuery<StarSearch[]>({
      ...keys.search.star,
      queryFn: () => api.get('/star').then(res => res.data),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  },
  useVideos: () => {
    const query = useQuery<VideoSearch[]>({
      ...keys.search.video,
      queryFn: () => api.get('/video').then(res => res.data),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  }
}
