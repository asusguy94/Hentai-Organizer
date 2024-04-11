import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@/config'
import { keys } from '@/keys'

const { api } = createApi('/bookmark')

//TODO add id as a parameter

export default {
  useRemoveBookmark: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
      mutationKey: ['bookmark', id, 'remove'],
      mutationFn: () => api.delete(`/${id}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetCategory: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { categoryID: number }>({
      mutationKey: ['bookmark', id, 'setCategory'],
      mutationFn: payload => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetOutfit: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { outfitID: number }>({
      mutationKey: ['bookmark', id, 'setOutfit'],
      mutationFn: payload => api.put(`/${id}/outfit`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useRemoveOutfit: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
      mutationKey: ['bookmark', id, 'removeOutfit'],
      mutationFn: () => api.delete(`/${id}/outfit`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useAddAttribute: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { attributeID: number }>({
      mutationKey: ['bookmark', id, 'addAttribute'],
      mutationFn: payload => api.post('/attribute', { bookmarkID: id, attributeID: payload.attributeID }),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useRemoveAttribute: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { attributeID: number }>({
      mutationKey: ['bookmark', id, 'removeAttribute'],
      mutationFn: ({ attributeID }) => api.delete(`/${id}/attribute/${attributeID}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useClearAttributes: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
      mutationKey: ['bookmark', id, 'clearAttributes'],
      mutationFn: () => api.delete(`/${id}/attribute`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useRemoveStar: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
      mutationKey: ['bookmark', id, 'removeStar'],
      mutationFn: () => api.delete(`${id}/star`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetTime: (videoId: number, id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { time: number }>({
      mutationKey: ['bookmark', id, 'setTime'],
      mutationFn: payload => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useAddStar: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; starID: number }>({
      mutationKey: ['bookmark', 'addStar'],
      mutationFn: ({ id, ...payload }) => api.post(`/${id}/star`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useAddStarAttribute: (videoID: number, starID: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { attributeID: number }>({
      mutationKey: ['bookmark', videoID, 'star', starID, 'addAttribute'],
      mutationFn: payload => api.post('/attribute', { ...payload, videoID, starID }),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoID)._ctx.bookmark })
    })

    return { mutate }
  }
}
