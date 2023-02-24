import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { Outfit } from '@interfaces'

const baseURL = `${serverConfig.api}/outfit`

export default {
  useOutfits: () => useFetch<Outfit[]>(baseURL)
}
