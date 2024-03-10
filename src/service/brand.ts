import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { keys } from '@/keys'

const { api } = createApi('/brand')

export default {
  useAll: () => {
    const query = useQuery<string[]>({
      ...keys.brand.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
