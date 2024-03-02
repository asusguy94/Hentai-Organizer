import { keys } from '@keys'
import { useMutation, useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Bookmark, General, Validity, Video, VideoStar } from '@interfaces'

const { api } = createApi('/video')

type HomeVideo = {
  id: number
  name: string
  image: string | null
  total?: number
}

export default {
  renameVideo: (id: number, path: string) => api.put(`/${id}`, { path }).then(res => res.data),
  toggleCensor: (id: number, censored: boolean) => api.put(`/${id}`, { cen: !censored }).then(res => res.data),
  updateVideo: (id: number) => api.put(`/${id}`).then(res => res.data),
  deleteVideo: (id: number) => api.delete(`/${id}`).then(res => res.data),
  useAddBookmark: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { categoryID: number; time: number; starID?: number }>({
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
  renameFranchise: (id: number, value: string) => api.put(`/${id}`, { franchise: value }).then(res => res.data),
  renameTitle: (id: number, value: string) => api.put(`/${id}`, { title: value }).then(res => res.data),
  useRemoveStar: (id: number) => {
    const { mutate, mutateAsync } = useMutation<unknown, Error, { starID: number }>({
      mutationKey: ['video', id, 'removeStar'],
      mutationFn: ({ starID }) => api.delete(`/${id}/star/${starID}`).then(res => res.data)
    })

    return { mutate, mutateAsync }
  },
  toggleNoStar: (id: number, checked: boolean) => api.put(`/${id}`, { noStar: checked }),
  useAddStar: (id: number) => {
    const { mutate, mutateAsync } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['video', id, 'addStar'],
      mutationFn: payload => api.post(`/${id}/star`, payload).then(res => res.data)
    })

    return { mutate, mutateAsync }
  },
  useRelatedStars: (id: number) => {
    const query = useQuery<General[]>({
      ...keys.videos.related._ctx.star(id),
      queryFn: () => api.get(`/${id}/related/star`).then(res => res.data)
    })

    return { data: query.data }
  },
  removeAttribute: (id: number, attributeID: number) => {
    return api.delete(`/${id}/attribute/${attributeID}`).then(res => res.data)
  },
  addVideos: (videos: unknown[]) => api.post('/add', { videos }).then(res => res.data),
  setSlug: (id: number, slug: string) => api.put(`/${id}/api`, { slug }).then(res => res.data),
  setBrand: (id: number) => api.put(`/${id}/api`, { brand: true }).then(res => res.data),
  setDate: (id: number) => api.put(`/${id}/api`, { date: true }).then(res => res.data),
  setCover: (id: number) => api.put(`/${id}/api`, { cover: true }).then(res => res.data),
  setPoster: (id: number) => api.put(`/${id}/api`, { poster: true }).then(res => res.data),
  useHomeVideos: (label: string, limit: number) => {
    const query = useQuery<HomeVideo[]>({
      ...keys.videos.home(label, limit),
      queryFn: () => api.get(`/home/${label}/${limit}`).then(res => res.data)
    })

    return { data: query.data }
  },
  useStars: (id: number) => {
    const query = useQuery<VideoStar[]>({
      ...keys.videos.byId(id)._ctx.star,
      queryFn: () => api.get(`/${id}/star`).then(res => res.data)
    })

    return { data: query.data }
  },
  useIsValid: (id: number) => {
    //TODO can probably be merged with useVideo
    const query = useQuery<Validity>({
      ...keys.videos.byId(id)._ctx.validate,
      queryFn: () => api.get(`/${id}/validate`).then(res => res.data)
    })

    return { data: query.data }
  },
  useVideo: (id: number) => {
    const query = useQuery<Video>({
      ...keys.videos.byId(id),
      queryFn: () => api.get(`/${id}`).then(res => res.data)
    })

    return { data: query.data }
  },
  useBookmarks: (id: number) => {
    const query = useQuery<Bookmark[]>({
      ...keys.videos.byId(id)._ctx.bookmark,
      queryFn: () => api.get(`/${id}/bookmark`).then(res => res.data)
    })

    return { data: query.data }
  },
  useNewVideos: () => {
    type NewVideo = {
      path: string
      franchise: string
      episode: number
      name: string
      slug: string
    }

    const query = useQuery<NewVideo[]>({
      ...keys.videos.new,
      queryFn: () => api.get('/add').then(res => res.data)
    })

    return { data: query.data }
  },
  useVideos: () => {
    type AllVideos = {
      bookmarks: { noStar: General[] }
      video: { noBookmarks: General[]; noStars: General[]; slugMissmatch: General[]; unusedStar: General[] }
      stars: { noImage: General[] }
    }

    const query = useQuery<AllVideos>({
      ...keys.videos.all,
      queryFn: () => api.get('').then(res => res.data)
    })

    return { data: query.data }
  }
}
