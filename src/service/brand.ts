import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'

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
