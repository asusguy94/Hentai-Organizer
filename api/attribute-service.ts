import axios from 'axios'
import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { Attribute } from '@interfaces'

const baseURL = `${serverConfig.api}/attribute`
const api = axios.create({ baseURL })

export default {
  useAttributes: <T extends Attribute>() => useFetch<T[]>(baseURL),
  useVideoAttributes: () => useFetch<Attribute[]>(`${baseURL}/video`),
  setCondition: (id: number, prop: string, value: boolean) => api.put(`/${id}`, { label: prop, value })
}
