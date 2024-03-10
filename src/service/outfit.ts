import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { Outfit } from '@/interface'
import { keys } from '@/keys'

const { api } = createApi('/outfit')

export default {
  useAll: () => {
    const query = useQuery<Outfit[]>({
      ...keys.outfit.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
