import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { ICategory } from '@interfaces'

const baseUrl = `${serverConfig.api}/category`

export default {
  useCategories: () => useFetch<ICategory[]>(baseUrl)
}
