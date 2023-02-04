import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { IAttribute } from '@interfaces'

const baseURL = `${serverConfig.api}/attribute`

export default {
  useAttributes: <T extends IAttribute>() => useFetch<T[]>(baseURL),
  useVideoAttributes: () => useFetch<IAttribute[]>(`${baseURL}/video`)
}
