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
  useSetCategory: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetOutfit: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; outfitID: number }>({
      mutationKey: ['bookmark', 'setOutfit'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}/outfit`, payload),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  removeOutfit: (id: number) => api.delete(`/${id}/outfit`),
  useAddAttribute: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'addAttribute'],
      mutationFn: ({ id, ...payload }) => api.post('/attribute', { bookmarkID: id, attributeID: payload.attributeID }),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  useRemoveAttribute: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'removeAttribute'],
      mutationFn: ({ id, attributeID }) => api.delete(`/${id}/attribute/${attributeID}`),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  clearAttributes: (id: number) => api.delete(`/${id}/attribute`),
  removeStar: (id: number) => api.delete(`/${id}/star`),
  useSetTime: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  useAddStar: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; starID: number }>({
      mutationKey: ['bookmark', 'addStar'],
      mutationFn: ({ id, ...payload }) => api.post(`/${id}/star`, payload),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.star })
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
