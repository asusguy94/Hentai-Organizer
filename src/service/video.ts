import { keys } from '@keys'
import { useMutation, useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Bookmark, General, Validity, Video, VideoStar } from '@interfaces'
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
  useAddBookmark: (id: number) => {
    const { mutate } = useMutation<Bookmark, Error, { categoryID: number; time: number; starID?: number }>({
      mutationKey: ['video', id, 'addBookmark'],
      mutationFn: ({ starID, ...payload }) => {
        if (starID !== undefined) {
          return api.post(`/${id}/bookmark`, { ...payload, starID }).then(res => res.data)
        }

        return api.post(`/${id}/bookmark`, payload).then(res => res.data)
      }
    })

    return { mutate }
  },
  renameFranchise: (id: number, value: string) => api.put(`/${id}`, { franchise: value }),
  renameTitle: (id: number, value: string) => api.put(`/${id}`, { title: value }),
  useRemoveStar: (id: number) => {
    const { mutate, mutateAsync } = useMutation<unknown, Error, { starID: number }>({
      mutationKey: ['video', id, 'removeStar'],
      mutationFn: ({ starID }) => api.delete(`/${id}/star/${starID}`).then(res => res.data)
    })

    return { mutate, mutateAsync }
  },
  toggleNoStar: (id: number, checked: boolean) => api.put(`/${id}`, { noStar: checked }),
  useAddStar: (id: number) => {
    const { mutate, mutateAsync } = useMutation<VideoStar, Error, { name: string }>({
      mutationKey: ['video', id, 'addStar'],
      mutationFn: payload => api.post(`/${id}/star`, payload).then(res => res.data)
    })

    return { mutate, mutateAsync }
  },
  useRelatedStars: (id: number) => {
    const query = useQuery<General[]>({
      ...keys.videos.related._ctx.star(id),
      queryFn: () => getResponse(`${baseURL}/${id}/related/star`)
    })

    return { data: query.data }
  },
  removeAttribute: (id: number, attributeID: number) => api.delete(`/${id}/attribute/${attributeID}`),
  addVideos: (videos: unknown[]) => api.post('/add', { videos }),
  setSlug: (id: number, slug: string) => api.put(`/${id}/api`, { slug }),
  setBrand: (id: number) => api.put(`/${id}/api`, { brand: true }),
  setDate: (id: number) => api.put(`/${id}/api`, { date: true }),
  setCover: (id: number) => api.put(`/${id}/api`, { cover: true }),
  setPoster: (id: number) => api.put(`/${id}/api`, { poster: true }),
  useHomeVideos: (label: string, limit: number) => {
    const query = useQuery<HomeVideo[]>({
      ...keys.videos.home(label, limit),
      queryFn: () => getResponse(`${baseURL}/home/${label}/${limit}`)
    })

    return { data: query.data }
  },
  useStars: (id: number) => {
    const query = useQuery<VideoStar[]>({
      ...keys.videos.byId(id)._ctx.star,
      queryFn: () => getResponse(`${baseURL}/${id}/star`)
    })

    return { data: query.data }
  },
  useIsValid: (id: number) => {
    const query = useQuery<Validity>({
      ...keys.videos.byId(id)._ctx.validate,
      queryFn: () => getResponse(`${baseURL}/${id}/validate`)
    })

    return { data: query.data }
  },
  useVideo: (id: number) => {
    const query = useQuery<Video>({
      ...keys.videos.byId(id),
      queryFn: () => getResponse(`${baseURL}/${id}`)
    })

    return { data: query.data }
  },
  useBookmarks: (id: number) => {
    const query = useQuery<Bookmark[]>({
      ...keys.videos.byId(id)._ctx.bookmark,
      queryFn: () => getResponse(`${baseURL}/${id}/bookmark`)
    })

    return { data: query.data }
  },
  useNewVideos: () => {
    const query = useQuery<{ path: string; franchise: string; episode: number; name: string; slug: string }[]>({
      ...keys.videos.new,
      queryFn: () => getResponse(`${baseURL}/add`)
    })

    return { data: query.data }
  },
  useVideos: () => {
    const query = useQuery<{
      bookmarks: { noStar: General[] }
      video: { noBookmarks: General[]; noStars: General[]; slugMissmatch: General[]; unusedStar: General[] }
      stars: { noImage: General[] }
    }>({
      ...keys.videos.all,
      queryFn: () => getResponse(baseURL)
    })

    return { data: query.data }
  }
}
