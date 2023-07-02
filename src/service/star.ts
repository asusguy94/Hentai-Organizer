import { useFetch } from 'usehooks-ts'

import { createApi } from '@config'

const { api, baseURL } = createApi('/star')

export default {
  useInfo: () => {
    type StarInfo = {
      breast: string[]
      haircolor: string[]
      hairstyle: string[]
      attribute: string[]
    }

    return useFetch<StarInfo>(baseURL)
  },
  addAttribute: (id: number, name: string) => api.put(`/${id}/attribute`, { name }),
  removeAttribute: (id: number, name: string) => api.put(`/${id}/attribute`, { name, remove: true }),
  updateInfo: (id: number, label: string, value: string) => api.put(`/${id}`, { label, value }),
  addImage: (id: number, url: string) => api.post(`/${id}/image`, { url }),
  removeImage: (id: number) => api.delete(`/${id}/image`),
  removeStar: (id: number) => api.delete(`/${id}`),
  renameStar: (id: number, name: string) => api.put(`/${id}`, { name }),
  setLink: (id: number, value: string) => api.put(`/${id}`, { label: 'starLink', value })
}
