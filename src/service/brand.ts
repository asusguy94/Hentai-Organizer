import { useFetch } from 'usehooks-ts'

import { createApi } from '@config'
const { baseURL } = createApi('/brand')

export default {
  useBrands: () => useFetch<string[]>(baseURL)
}
