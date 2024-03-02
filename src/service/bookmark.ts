import { useMutation } from '@tanstack/react-query'

import { createApi } from '@config'

const { api } = createApi('/bookmark')

export default {
  removeBookmark: (id: number) => api.delete(`/${id}`).then(res => res.data),
  useSetCategory: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload).then(res => res.data)
    })

    return { mutate }
  },
  useSetOutfit: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; outfitID: number }>({
      mutationKey: ['bookmark', 'setOutfit'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}/outfit`, payload).then(res => res.data)
    })

    return { mutate }
  },
  removeOutfit: (id: number) => api.delete(`/${id}/outfit`).then(res => res.data),
  useAddAttribute: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'addAttribute'],
      mutationFn: ({ id, ...payload }) => {
        return api.post('/attribute', { bookmarkID: id, attributeID: payload.attributeID }).then(res => res.data)
      }
    })

    return { mutate }
  },
  useRemoveAttribute: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; attributeID: number }>({
      mutationKey: ['bookmark', 'removeAttribute'],
      mutationFn: ({ id, attributeID }) => api.delete(`/${id}/attribute/${attributeID}`).then(res => res.data)
    })

    return { mutate }
  },
  clearAttributes: (id: number) => api.delete(`/${id}/attribute`).then(res => res.data),
  removeStar: (id: number) => api.delete(`/${id}/star`).then(res => res.data),
  useSetTime: () => {
    // TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload).then(res => res.data)
    })

    return { mutate }
  },
  useAddStar: () => {
    //TODO add id as a parameter
    const { mutate } = useMutation<unknown, Error, { id: number; starID: number }>({
      mutationKey: ['bookmark', 'addStar'],
      mutationFn: ({ id, ...payload }) => api.post(`/${id}/star`, payload).then(res => res.data)
    })

    return { mutate }
  },
  useAddStarAttribute: (videoID: number, starID: number) => {
    const { mutate } = useMutation<unknown, Error, { attributeID: number }>({
      mutationKey: ['bookmark', videoID, 'star', starID, 'addAttribute'],
      mutationFn: payload => api.post('/attribute', { ...payload, videoID, starID }).then(res => res.data)
    })

    return { mutate }
  }
}
