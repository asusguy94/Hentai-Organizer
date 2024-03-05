import { keys } from '@keys'
import { useMutation, useQuery } from '@tanstack/react-query'

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
      ...keys.stars.info,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  },
  useAddAttribute: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['star', id, 'addAttribute'],
      mutationFn: payload => api.put(`/${id}/attribute`, payload)
    })

    return { mutate }
  },
  useRemoveAttribute: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['star', id, 'removeAttribute'],
      mutationFn: payload => api.put(`/${id}/attribute`, { ...payload, remove: true })
    })

    return { mutate }
  },
  useUpdateInfo: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { label: string; value: string }>({
      mutationKey: ['star', id, 'updateInfo'],
      mutationFn: payload => api.put(`/${id}`, payload)
    })

    return { mutate }
  },
  useAddImage: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { url: string }>({
      mutationKey: ['star', id, 'addImage'],
      mutationFn: payload => api.post(`/${id}/image`, payload)
    })

    return { mutate }
  },
  removeImage: (id: number) => legacyApi.delete(`/${id}/image`).then(res => res.data),
  removeStar: (id: number) => legacyApi.delete(`/${id}`).then(res => res.data),
  renameStar: (id: number, name: string) => legacyApi.put(`/${id}`, { name }).then(res => res.data),
  setLink: (id: number, value: string) => legacyApi.put(`/${id}`, { label: 'starLink', value }).then(res => res.data),
  useVideos: (id: number) => {
    const query = useQuery<StarVideo[]>({
      ...keys.stars.byId(id)._ctx.video,
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
      ...keys.stars.byId(id),
      queryFn: () => api.get(`/${id}`)
    })

    return { data: query.data }
  }
}
