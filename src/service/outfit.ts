import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Outfit } from '@interfaces'
import { getResponse } from '@utils/shared'

const { baseURL } = createApi('/outfit')

export default {
  useAll: () => {
    const query = useQuery<Outfit[]>({
      queryKey: ['outfit'],
      queryFn: () => getResponse(baseURL)
    })

    return { data: query.data }
  }
}
