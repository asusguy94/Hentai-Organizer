import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { Category } from '@interfaces'

const baseURL = `${serverConfig.api}/category`

export default {
  useCategories: () => useFetch<Category[]>(baseURL)
}
