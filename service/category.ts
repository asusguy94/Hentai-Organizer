import { useFetch } from 'usehooks-ts'

import { Category } from '@interfaces'

import { createApi } from '@config'
const { baseURL } = createApi('/category')

export default {
  useCategories: () => useFetch<Category[]>(baseURL)
}
