import { useMutation } from '@tanstack/react-query'

import { createApi } from '@config'

const { api } = createApi('/bookmark')

export default {
  removeBookmark: (id: number) => api.delete(`/${id}`),
  useSetCategory: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload)
    })

    return { mutate }
  },
  useSetOutfit: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; outfitID: number }>({
      mutationKey: ['bookmark', 'setOutfit'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}/outfit`, payload)
    })

    return { mutate }
  },
  removeOutfit: (id: number) => api.delete(`/${id}/outfit`),
  useAddAttribute: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'addAttribute'],
      mutationFn: ({ id, ...payload }) => api.post('/attribute', { bookmarkID: id, attributeID: payload.attributeID })
    })

    return { mutate }
  },
  useRemoveAttribute: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'removeAttribute'],
      mutationFn: ({ id, attributeID }) => api.delete(`/${id}/attribute/${attributeID}`)
    })

    return { mutate }
  },
  clearAttributes: (id: number) => api.delete(`/${id}/attribute`),
  removeStar: (id: number) => api.delete(`/${id}/star`),
  useSetTime: () => {
    // TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload)
    })

    return { mutate }
  },
  addStar: (id: number, starID: number) => api.post(`/${id}/star`, { starID }),
  useAddStar: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; starID: number }>({
      mutationKey: ['bookmark', 'addStar'],
      mutationFn: ({ id, ...payload }) => api.post(`/${id}/star`, payload)
    })

    return { mutate }
  },
  addStarAttribute: (videoID: number, starID: number, attributeID: number) => {
    return api.post('/attribute', { videoID, starID, attributeID })
  }
}
