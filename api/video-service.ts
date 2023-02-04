import axios, { AxiosResponse } from 'axios'
import { useFetch } from 'usehooks-ts'

import { serverConfig } from '@config'
import { IBookmark, IGeneral, IVideo, IVideoStar } from '@interfaces'

const baseURL = `${serverConfig.api}/video`
const api = axios.create({ baseURL })

function addBookmark(id: number, categoryID: number, time: number, starID?: number): Promise<AxiosResponse<any, any>> {
  if (starID !== undefined) {
    return api.post(`/${id}/bookmark`, { categoryID, time, starID })
  }

  return api.post(`/${id}/bookmark`, { categoryID, time })
}

// handle this number on the server
const defaultNumber = 0
export default {
  useVideo: (id: number = defaultNumber) => useFetch<IVideo>(`${baseURL}/${id}`),
  useStars: (id: number = defaultNumber) => useFetch<IVideoStar[]>(`${baseURL}/${id}/star`),
  useBookmarks: (id: number = defaultNumber) => useFetch<IBookmark[]>(`${baseURL}/${id}/bookmark`),
  addPlays: (id: number) => api.put(`/${id}`, { plays: 1 }),
  resetPlays: (id: number) => api.put(`/${id}`, { plays: 0 }),
  renameVideo: (id: number, path: string) => api.put(`/${id}`, { path }),
  toggleCensor: (id: number, censored: boolean) => api.put(`/${id}`, { cen: !censored }),
  updateVideo: (id: number) => api.put(`/${id}`),
  setCover: (id: number, url: string) => api.put(`/${id}`, { cover: url }),
  deleteVideo: (id: number) => api.delete(`/${id}`),
  addBookmark: (id: number, categoryID: number, time: number, starID?: number) => {
    if (starID !== undefined) return api.post(`/${id}/bookmark`, { categoryID, time, starID })
    return api.post(`/${id}/bookmark`, { categoryID, time })
  },
  renameFranchise: (id: number, value: string) => api.put(`/${id}`, { franchise: value }),
  renameTitle: (id: number, value: string) => api.put(`/${id}`, { title: value }),
  setBrand: (id: number, brand: string) => api.put(`/${id}`, { brand }),
  setDate: (id: number, date: string) => api.put(`/${id}`, { date }),
  useMissingStar: () => useFetch<IGeneral[]>('/missing-star'),
  removeStar: (id: number, starID: number) => api.delete(`/${id}/star/${starID}`),
  toggleNoStar: <T = any>(id: number, checked: boolean) => api.put<T>(`/${id}`, { noStar: checked }),
  addStar: <T = any>(id: number, name: string) => api.post<T>(`/${id}/star`, { name }),
  useRelatedStars: (id: number) => useFetch<IGeneral[]>(`/${id}/related/star`),
  removeAttribute: (id: number, attributeID: number) => api.delete(`/${id}/attribute/${attributeID}`)
}
