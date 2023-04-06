import { useFetch } from 'usehooks-ts'

import { Attribute } from '@interfaces'

import { createApi } from '@config'
const { api, baseURL } = createApi('/attribute')

export default {
  useAttributes: <T extends Attribute>() => useFetch<T[]>(baseURL),
  useVideoAttributes: () => useFetch<Attribute[]>(`${baseURL}/video`),
  setCondition: (id: number, prop: string, value: boolean) => api.put(`/${id}`, { label: prop, value })
}
