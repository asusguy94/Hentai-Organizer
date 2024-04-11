import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@/config'
import { Bookmark, General, Video, VideoStar } from '@/interface'
import { keys } from '@/keys'

const { api } = createApi('/video')

type HomeVideo = {
  id: number
  name: string
  image: string | null
  total?: number
}

export default {
  addPlay: (id: number) => api.put(`/${id}`, { plays: 1 }),
  resetPlays: (id: number) => api.put(`/${id}`, { plays: 0 }),
  renameVideo: (id: number, path: string) => api.put(`/${id}`, { path }),
  useToggleCensor: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { cen: boolean }>({
      mutationKey: ['video', id, 'toggleCensor'],
      mutationFn: payload => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id) })
    })

    return { mutate }
  },
  updateVideo: (id: number) => api.put(`/${id}`),
  deleteVideo: (id: number) => api.delete(`/${id}`),
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
  renameFranchise: (id: number, value: string) => api.put(`/${id}`, { franchise: value }),
  renameTitle: (id: number, value: string) => api.put(`/${id}`, { title: value }),
  useRemoveStar: (id: number) => {
    const queryClient = useQueryClient()

    type Payload = { starID: number }
    const { mutate: mutateSync, mutateAsync } = useMutation<unknown, Error, Payload>({
      mutationKey: ['video', id, 'removeStar'],
      mutationFn: ({ starID }) => api.delete(`/${id}/star/${starID}`)
    })

    const onSuccess = () => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.star })

    const mutate = (payload: Payload) => {
      mutateSync(payload, {
        onSuccess: () => {
          onSuccess()
        }
      })
    }

    const mutateAll = (payloads: Payload[]) => {
      Promise.allSettled(payloads.map(payload => mutateAsync(payload))).then(() => {
        onSuccess()
      })
    }

    return { mutate, mutateAll }
  },
  toggleNoStar: (id: number, checked: boolean) => api.put(`/${id}`, { noStar: checked }),
  useAddStar: (id: number) => {
    const queryClient = useQueryClient()

    type Payload = { name: string }
    const { mutate: mutateSync, mutateAsync } = useMutation<unknown, Error, Payload>({
      mutationKey: ['video', id, 'addStar'],
      mutationFn: payload => api.post(`/${id}/star`, payload)
    })

    const onSuccess = () => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.star })

    const mutate = (payload: Payload) => {
      mutateSync(payload, {
        onSuccess: () => {
          onSuccess()
        }
      })
    }

    const mutateAll = (payloads: Payload[]) => {
      Promise.allSettled(payloads.map(payload => mutateAsync(payload))).then(() => {
        onSuccess()
      })
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
  removeAttribute: (id: number, attributeID: number) => api.delete(`/${id}/attribute/${attributeID}`),
  addVideos: (videos: unknown[]) => api.post('/add', { videos }),
  setSlug: (id: number, slug: string) => api.put(`/${id}/api`, { slug }),
  useSetBrand: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
      mutationKey: ['video', id, 'setBrand'],
      mutationFn: () => api.put(`/${id}/api`, { brand: true }),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id) })
    })

    return { mutate }
  },
  useSetDate: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
      mutationKey: ['video', id, 'setDate'],
      mutationFn: () => api.put(`/${id}/api`, { date: true }),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id) })
    })

    return { mutate }
  },
  setDate: (id: number) => api.put(`/${id}/api`, { date: true }),
  setCover: (id: number) => api.put(`/${id}/api`, { cover: true }),
  setPoster: (id: number) => api.put(`/${id}/api`, { poster: true }),
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
