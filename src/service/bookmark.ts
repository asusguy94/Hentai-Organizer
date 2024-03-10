import { keys } from '@keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@config'

const { api } = createApi('/bookmark')

//TODO add id as a parameter

export default {
  useRemoveBookmark: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number }>({
      mutationKey: ['bookmark', 'remove'],
      mutationFn: ({ id }) => api.delete(`/${id}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetCategory: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetOutfit: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; outfitID: number }>({
      mutationKey: ['bookmark', 'setOutfit'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}/outfit`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  removeOutfit: (id: number) => api.delete(`/${id}/outfit`),
  useAddAttribute: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'addAttribute'],
      mutationFn: ({ id, ...payload }) => {
        return api.post('/attribute', { bookmarkID: id, attributeID: payload.attributeID })
      },
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useRemoveAttribute: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'removeAttribute'],
      mutationFn: ({ id, attributeID }) => api.delete(`/${id}/attribute/${attributeID}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  clearAttributes: (id: number) => api.delete(`/${id}/attribute`),
  useRemoveStar: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number }>({
      mutationKey: ['bookmark', 'removeStar'],
      mutationFn: ({ id }) => api.delete(`${id}/star`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetTime: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
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
