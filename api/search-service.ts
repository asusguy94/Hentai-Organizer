import { useFetch } from 'usehooks-ts'

import { IndexType, IStar, MakeOptional } from '@interfaces'

import { serverConfig } from '@config'

const baseURL = `${serverConfig.api}/search`

export default {
  useStars: () => useFetch<MakeOptional<IStar, 'hidden'>[]>(`${baseURL}/star`),
  useVideos: <T extends IndexType<any>>() => useFetch<MakeOptional<T, 'hidden'>[]>(`${baseURL}/video`)
}
