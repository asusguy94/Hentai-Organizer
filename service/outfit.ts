import { useFetch } from 'usehooks-ts'

import { Outfit } from '@interfaces'

import { createApi } from '@config'
const { baseURL } = createApi('/outfit')

export default {
  useOutfits: () => useFetch<Outfit[]>(baseURL)
}
