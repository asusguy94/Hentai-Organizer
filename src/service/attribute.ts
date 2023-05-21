import { createApi } from '@config'
const { api } = createApi('/attribute')

export default {
  setCondition: (id: number, prop: string, value: boolean) => api.put(`/${id}`, { label: prop, value })
}
