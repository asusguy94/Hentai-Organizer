import { keys } from '@keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@config'
import { StarVideo } from '@interfaces'

const { api, legacyApi } = createApi('/star')

type StarInfo = {
  breast: string[]
  haircolor: string[]
  hairstyle: string[]
  attribute: string[]
}

export default {
  useInfo: () => {
    const query = useQuery<StarInfo>({
      ...keys.star.info,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  },
  useAddAttribute: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['star', id, 'addAttribute'],
      mutationFn: payload => api.put(`/${id}/attribute`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  useRemoveAttribute: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['star', id, 'removeAttribute'],
      mutationFn: payload => api.put(`/${id}/attribute`, { ...payload, remove: true }),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  useUpdateInfo: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { label: string; value: string }>({
      mutationKey: ['star', id, 'updateInfo'],
      mutationFn: payload => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  useAddImage: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { url: string }>({
      mutationKey: ['star', id, 'addImage'],
      mutationFn: payload => api.post(`/${id}/image`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  removeImage: (id: number) => legacyApi.delete(`/${id}/image`),
  removeStar: (id: number) => legacyApi.delete(`/${id}`),
  renameStar: (id: number, name: string) => legacyApi.put(`/${id}`, { name }),
  setLink: (id: number, value: string) => legacyApi.put(`/${id}`, { label: 'starLink', value }),
  useVideos: (id: number) => {
    const query = useQuery<StarVideo[]>({
      ...keys.star.byId(id)._ctx.video,
      queryFn: () => api.get(`/${id}/video`)
    })

    return { data: query.data }
  },
  useStar: (id: number) => {
    type Star = {
      id: number
      name: string
      image: string | null
      info: {
        breast: string
        haircolor: string
        hairstyle: string
        attribute: string[]
      }
      link: string | null
    }

    const query = useQuery<Star>({
      ...keys.star.byId(id),
      queryFn: () => api.get(`/${id}`)
    })

    return { data: query.data }
  }
}
