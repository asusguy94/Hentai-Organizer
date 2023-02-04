import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'

const baseURL = `${serverConfig.api}/brand`

export default {
  useBrands: () => useFetch<string[]>(baseURL)
}
