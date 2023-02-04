import axios from 'axios'
import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'

const baseURL = `${serverConfig.api}/star`
const api = axios.create({ baseURL })

// handle this number on the server
const defaultNumber = 0
export default {
  useStar: <T>(id: number = defaultNumber) => useFetch<T>(`${baseURL}/${id}`),
  useVideos: <T>(id: number = defaultNumber) => useFetch<T[]>(`${baseURL}/${id}/video`),
  useInfo: () => {
    interface IStarInfo {
      breast: string[]
      haircolor: string[]
      hairstyle: string[]
      attribute: string[]
    }

    return useFetch<IStarInfo>(baseURL)
  },
  addAttribute: (id: number, name: string) => api.put(`/${id}/attribute`, { name }),
  removeAttribute: (id: number, name: string) => api.put(`/${id}/attribute`, { name, remove: true }),
  updateInfo: (id: number, label: string, value: string) => api.put(`/${id}`, { label, value }),
  addImage: (id: number, url: string) => api.post(`/${id}/image`, { url }),
  removeImage: (id: number) => api.delete(`/${id}/image`),
  removeStar: (id: number) => api.delete(`/${id}`),
  renameStar: (id: number, name: string) => axios.put(`/${id}`, { name }),
  setLink: (id: number, value: string) => api.put(`/${id}`, { label: 'starLink', value })
}
