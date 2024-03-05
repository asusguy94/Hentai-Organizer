import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Outfit } from '@interfaces'

const { api } = createApi('/outfit')

export default {
  useAll: () => {
    const query = useQuery<Outfit[]>({
      ...keys.outfits.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
