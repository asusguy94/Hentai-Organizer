import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Attribute } from '@interfaces'

const { api } = createApi('/attribute')

export default {
  useAll: () => {
    const query = useQuery<Attribute[]>({
      ...keys.attributes.all,
      queryFn: () => api.get('').then(res => res.data)
    })

    return { data: query.data }
  }
}
