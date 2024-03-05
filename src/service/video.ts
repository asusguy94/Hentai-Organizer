import { keys } from '@keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@config'
import { Bookmark, General, Video, VideoStar } from '@interfaces'

const { api, legacyApi } = createApi('/video')

type HomeVideo = {
  id: number
  name: string
  image: string | null
  total?: number
}

export default {
  renameVideo: (id: number, path: string) => legacyApi.put(`/${id}`, { path }),
  toggleCensor: (id: number, censored: boolean) => legacyApi.put(`/${id}`, { cen: !censored }),
  updateVideo: (id: number) => legacyApi.put(`/${id}`),
  deleteVideo: (id: number) => legacyApi.delete(`/${id}`),
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
  renameFranchise: (id: number, value: string) => legacyApi.put(`/${id}`, { franchise: value }),
  renameTitle: (id: number, value: string) => legacyApi.put(`/${id}`, { title: value }),
  useRemoveStar: (id: number) => {
    const queryClient = useQueryClient()

    const onSuccess = () => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.star })

    type Payload = { starID: number }

    const { mutate: mutateSync, mutateAsync } = useMutation<unknown, Error, Payload>({
      mutationKey: ['video', id, 'removeStar'],
      mutationFn: ({ starID }) => api.delete(`/${id}/star/${starID}`)
    })

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
  removeAttribute: (id: number, attributeID: number) => legacyApi.delete(`/${id}/attribute/${attributeID}`),
  addVideos: (videos: unknown[]) => legacyApi.post('/add', { videos }),
  setSlug: (id: number, slug: string) => legacyApi.put(`/${id}/api`, { slug }),
  setBrand: (id: number) => legacyApi.put(`/${id}/api`, { brand: true }),
  setDate: (id: number) => legacyApi.put(`/${id}/api`, { date: true }),
  setCover: (id: number) => legacyApi.put(`/${id}/api`, { cover: true }),
  setPoster: (id: number) => legacyApi.put(`/${id}/api`, { poster: true }),
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
