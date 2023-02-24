import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { Category } from '@interfaces'

const baseUrl = `${serverConfig.api}/category`

export default {
  useCategories: () => useFetch<Category[]>(baseUrl)
}
