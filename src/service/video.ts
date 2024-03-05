import { keys } from '@keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@config'
import { Bookmark, General, Validity, Video, VideoStar } from '@interfaces'

const { api, legacyApi } = createApi('/video')

type HomeVideo = {
  id: number
  name: string
  image: string | null
  total?: number
}

export default {
  renameVideo: (id: number, path: string) => legacyApi.put(`/${id}`, { path }).then(res => res.data as unknown),
  toggleCensor: (id: number, censored: boolean) => {
    return legacyApi.put(`/${id}`, { cen: !censored }).then(res => res.data as unknown)
  },
  updateVideo: (id: number) => legacyApi.put(`/${id}`).then(res => res.data as unknown),
  deleteVideo: (id: number) => legacyApi.delete(`/${id}`).then(res => res.data as unknown),
  useAddBookmark: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { categoryID: number; time: number; starID?: number }>({
      mutationKey: ['video', id, 'addBookmark'],
      mutationFn: ({ starID, ...payload }) => {
        if (starID !== undefined) {
          return api.post(`/${id}/bookmark`, { ...payload, starID })
        }

        return api.post(`/${id}/bookmark`, payload)
      },
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  renameFranchise: (id: number, value: string) => {
    return legacyApi.put(`/${id}`, { franchise: value }).then(res => res.data as unknown)
  },
  renameTitle: (id: number, value: string) => {
    return legacyApi.put(`/${id}`, { title: value }).then(res => res.data as unknown)
  },
  useRemoveStar: (id: number) => {
    const queryClient = useQueryClient()

    const onSuccess = () => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.star })

    type Payload = { starID: number }

    const { mutate: mutateSync, mutateAsync } = useMutation<unknown, Error, Payload>({
      mutationKey: ['video', id, 'removeStar'],
      mutationFn: ({ starID }) => api.delete(`/${id}/star/${starID}`)
    })

    const mutate = (payload: Payload) => {
      mutateSync(payload)
      onSuccess()
    }

    const mutateAll = async (payload: Payload[]) => {
      await Promise.allSettled(payload.map(p => mutateAsync(p)))
      onSuccess()
    }

    return { mutate, mutateAll }
  },
  toggleNoStar: (id: number, checked: boolean) => legacyApi.put(`/${id}`, { noStar: checked }),
  useAddStar: (id: number) => {
    const queryClient = useQueryClient()

    type Payload = { name: string }

    const onSuccess = () => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.star })

    const { mutate: mutateSync, mutateAsync } = useMutation<unknown, Error, Payload>({
      mutationKey: ['video', id, 'addStar'],
      mutationFn: payload => api.post(`/${id}/star`, payload)
    })

    const mutate = (payload: Payload) => {
      mutateSync(payload)
      onSuccess()
    }

    const mutateAll = async (payload: Payload[]) => {
      await Promise.allSettled(payload.map(p => mutateAsync(p)))
      onSuccess()
    }

    return { mutate, mutateAll }
  },
  useRelatedStars: (id: number) => {
    const query = useQuery<General[]>({
      ...keys.video.related._ctx.star(id),
      queryFn: () => api.get(`/${id}/related/star`)
    })

    return { data: query.data }
  },
  removeAttribute: (id: number, attributeID: number) => {
    return legacyApi.delete(`/${id}/attribute/${attributeID}`).then(res => res.data as unknown)
  },
  addVideos: (videos: unknown[]) => legacyApi.post('/add', { videos }).then(res => res.data as unknown),
  setSlug: (id: number, slug: string) => legacyApi.put(`/${id}/api`, { slug }).then(res => res.data as unknown),
  setBrand: (id: number) => legacyApi.put(`/${id}/api`, { brand: true }).then(res => res.data as unknown),
  setDate: (id: number) => legacyApi.put(`/${id}/api`, { date: true }).then(res => res.data as unknown),
  setCover: (id: number) => legacyApi.put(`/${id}/api`, { cover: true }).then(res => res.data as unknown),
  setPoster: (id: number) => legacyApi.put(`/${id}/api`, { poster: true }).then(res => res.data as unknown),
  useHomeVideos: (label: string, limit: number) => {
    const query = useQuery<HomeVideo[]>({
      ...keys.video.home(label, limit),
      queryFn: () => api.get(`/home/${label}/${limit}`)
    })

    return { data: query.data }
  },
  useStars: (id: number) => {
    const query = useQuery<VideoStar[]>({
      ...keys.video.byId(id)._ctx.star,
      queryFn: () => api.get(`/${id}/star`)
    })

    return { data: query.data }
  },
  useIsValid: (id: number) => {
    //TODO can probably be merged with useVideo
    const query = useQuery<Validity>({
      ...keys.video.byId(id)._ctx.validate,
      queryFn: () => api.get(`/${id}/validate`)
    })

    return { data: query.data }
  },
  useVideo: (id: number) => {
    const query = useQuery<Video>({
      ...keys.video.byId(id),
      queryFn: () => api.get(`/${id}`)
    })

    return { data: query.data }
  },
  useBookmarks: (id: number) => {
    const query = useQuery<Bookmark[]>({
      ...keys.video.byId(id)._ctx.bookmark,
      queryFn: () => api.get(`/${id}/bookmark`)
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
      ...keys.video.new,
      queryFn: () => api.get('/add')
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
      ...keys.video.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
