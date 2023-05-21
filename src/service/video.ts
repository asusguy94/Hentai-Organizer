import { useFetch } from 'usehooks-ts'

import { General, Video, VideoStar } from '@interfaces'
import { createApi } from '@config'

const { api, baseURL } = createApi('/video')

export default {
  // TODO handle defaultNumber=0 on the server
  addPlays: (id: number) => api.put(`/${id}`, { plays: 1 }),
  resetPlays: (id: number) => api.put(`/${id}`, { plays: 0 }),
  renameVideo: (id: number, path: string) => api.put(`/${id}`, { path }),
  toggleCensor: (id: number, censored: boolean) => api.put(`/${id}`, { cen: !censored }),
  updateVideo: (id: number) => api.put(`/${id}`),
  setCover: (id: number, url: string) => api.put(`/${id}`, { cover: url }),
  deleteVideo: (id: number) => api.delete(`/${id}`),
  addBookmark: (id: number, categoryID: number, time: number, starID?: number) => {
    if (starID !== undefined) return api.post<any>(`/${id}/bookmark`, { categoryID, time, starID })
    return api.post<any>(`/${id}/bookmark`, { categoryID, time })
  },
  renameFranchise: (id: number, value: string) => api.put(`/${id}`, { franchise: value }),
  renameTitle: (id: number, value: string) => api.put(`/${id}`, { title: value }),
  setBrand: (id: number, brand: string) => api.put(`/${id}`, { brand }),
  setDate: <T extends { date_published: Video['date']['published'] }>(id: number, date: string) => {
    return api.put<T>(`/${id}`, { date })
  },
  removeStar: (id: number, starID: number) => api.delete(`/${id}/star/${starID}`),
  toggleNoStar: <T = any>(id: number, checked: boolean) => api.put<T>(`/${id}`, { noStar: checked }),
  addStar: (id: number, name: string) => api.post<VideoStar>(`/${id}/star`, { name }),
  useRelatedStars: (id: number) => useFetch<General[]>(`${baseURL}/${id}/related/star`),
  removeAttribute: (id: number, attributeID: number) => api.delete(`/${id}/attribute/${attributeID}`),
  addVideos: <T = any>(videos: T[]) => api.post('/add', { videos })
}
