import { keys } from '@keys'
import { useMutation, useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { StarVideo } from '@interfaces'
import { getResponse } from '@utils/shared'

const { api, baseURL } = createApi('/star')

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
      queryFn: () => getResponse(baseURL)
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
      mutationFn: payload => api.post(`/${id}/image`, payload).then(res => res.data)
    })

    return { mutate }
  },
  removeImage: (id: number) => api.delete(`/${id}/image`),
  removeStar: (id: number) => api.delete(`/${id}`),
  renameStar: (id: number, name: string) => api.put(`/${id}`, { name }),
  setLink: (id: number, value: string) => api.put(`/${id}`, { label: 'starLink', value }),
  useVideos: (id: number) => {
    const query = useQuery<StarVideo[]>({
      ...keys.stars.byId(id)._ctx.video,
      queryFn: () => getResponse(`${baseURL}/${id}/video`)
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
      queryFn: () => getResponse(`${baseURL}/${id}`)
    })

    return { data: query.data }
  }
}
