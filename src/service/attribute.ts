import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Attribute } from '@interfaces'
import { getResponse } from '@utils/shared'

const { baseURL } = createApi('/attribute')

export default {
  useAll: () => {
    const query = useQuery<Attribute[]>({
      ...keys.attributes.all,
      queryFn: () => getResponse(baseURL)
    })

    return { data: query.data }
  }
}
