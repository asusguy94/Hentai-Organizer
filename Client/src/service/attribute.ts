import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { Attribute } from '@/interface'
import { keys } from '@/keys'

const { api } = createApi('/attribute')

export default {
  useAll: () => {
    const query = useQuery<Attribute[]>({
      ...keys.attribute.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  },
  useVideos: () => {
    const query = useQuery<Attribute[]>({
      ...keys.attribute.video,
      queryFn: () => api.get('/video')
    })

    return { data: query.data }
  }
}
