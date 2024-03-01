import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { StarSearch, VideoSearch } from '@interfaces'
import { getResponse } from '@utils/shared'

const { baseURL } = createApi('/search')

export default {
  useStars: () => {
    const query = useQuery<StarSearch[]>({
      queryKey: ['search', 'star'],
      queryFn: () => getResponse(`${baseURL}/star`),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  },
  useVideos: () => {
    const query = useQuery<VideoSearch[]>({
      queryKey: ['search', 'video'],
      queryFn: () => getResponse(`${baseURL}/video`),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  }
}
