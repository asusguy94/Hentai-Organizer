import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Category } from '@interfaces'

const { api } = createApi('/category')

export default {
  useAll: () => {
    const query = useQuery<Category[]>({
      ...keys.category.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
