import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { Attribute } from '@interfaces'

const baseURL = `${serverConfig.api}/attribute`

export default {
  useAttributes: <T extends Attribute>() => useFetch<T[]>(baseURL),
  useVideoAttributes: () => useFetch<Attribute[]>(`${baseURL}/video`)
}
