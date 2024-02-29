/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { General, VideoStar } from '@interfaces'
import { getResponse } from '@utils/shared'

const { api, baseURL } = createApi('/video')

type HomeVideo = {
  id: number
  name: string
  image: string | null
  total?: number
}

export default {
  renameVideo: (id: number, path: string) => api.put(`/${id}`, { path }),
  toggleCensor: (id: number, censored: boolean) => api.put(`/${id}`, { cen: !censored }),
  updateVideo: (id: number) => api.put(`/${id}`),
  deleteVideo: (id: number) => api.delete(`/${id}`),
  addBookmark: (id: number, categoryID: number, time: number, starID?: number) => {
    if (starID !== undefined) return api.post<any>(`/${id}/bookmark`, { categoryID, time, starID })
    return api.post<any>(`/${id}/bookmark`, { categoryID, time })
  },
  renameFranchise: (id: number, value: string) => api.put(`/${id}`, { franchise: value }),
  renameTitle: (id: number, value: string) => api.put(`/${id}`, { title: value }),
  removeStar: (id: number, starID: number) => api.delete(`/${id}/star/${starID}`),
  toggleNoStar: (id: number, checked: boolean) => api.put(`/${id}`, { noStar: checked }),
  addStar: (id: number, name: string) => api.post<VideoStar>(`/${id}/star`, { name }),
  useRelatedStars: (id: number) => {
    const query = useQuery<General[]>({
      queryKey: ['video', 'related', 'stars', id],
      queryFn: () => getResponse(`${baseURL}/${id}/related/star`)
    })

    return { data: query.data }
  },
  removeAttribute: (id: number, attributeID: number) => api.delete(`/${id}/attribute/${attributeID}`),
  addVideos: <T = any>(videos: T[]) => api.post('/add', { videos }),
  setSlug: (id: number, slug: string) => api.put(`/${id}/api`, { slug }),
  setBrand: (id: number) => api.put(`/${id}/api`, { brand: true }),
  setDate: (id: number) => api.put(`/${id}/api`, { date: true }),
  setCover: (id: number) => api.put(`/${id}/api`, { cover: true }),
  setPoster: (id: number) => api.put(`/${id}/api`, { poster: true }),
  useHomeVideos: (label: string, limit: number) => {
    const query = useQuery<HomeVideo[]>({
      queryKey: ['videos', 'home', label, limit],
      queryFn: () => getResponse(`${baseURL}/home/${label}/${limit}`)
    })

    return { data: query.data }
  }
}
