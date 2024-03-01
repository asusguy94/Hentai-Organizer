import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Category } from '@interfaces'
import { getResponse } from '@utils/shared'

const { baseURL } = createApi('/category')

export default {
  useAll: () => {
    const query = useQuery<Category[]>({
      queryKey: ['category'],
      queryFn: () => getResponse(baseURL)
    })

    return { data: query.data }
  }
}
