import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Category } from '@interfaces'

const { api } = createApi('/category')

export default {
  useAll: () => {
    const query = useQuery<Category[]>({
      ...keys.categories.all,
      queryFn: () => api.get('').then(res => res.data)
    })

    return { data: query.data }
  }
}
