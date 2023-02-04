import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { IOutfit } from '@interfaces'

const baseURL = `${serverConfig.api}/outfit`

export default {
  useOutfits: () => useFetch<IOutfit[]>(baseURL)
}
