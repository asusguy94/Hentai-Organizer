import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { createApi } from '@/config'
import { StarVideo } from '@/interface'
import { keys } from '@/keys'

const { api } = createApi('/star')

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
    const { mutate } = useMutation<unknown, Error, { url: string }>({
      mutationKey: ['star', id, 'addImage'],
      mutationFn: payload => api.post(`/${id}/image`, payload),
      onSuccess: () => {
        // reload required for context-menu to update
        location.reload()
      }
    })

    return { mutate }
  },
  useRemoveImage: (id: number) => {
    const { mutate } = useMutation({
      mutationKey: ['star', id, 'removeImage'],
      mutationFn: () => api.delete(`/${id}/image`),
      onSuccess: () => {
        // reload required for context-menu to update
        location.reload()
      }
    })

    return { mutate }
  },
  useRemoveStar: (id: number) => {
    const navigate = useNavigate()

    const { mutate } = useMutation({
      mutationKey: ['star', id, 'remove'],
      mutationFn: () => api.delete(`/${id}`),
      onSuccess: () => {
        navigate({
          to: '/',
          replace: true
        })
      }
    })

    return { mutate }
  },
  useRenameStar: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['star', id, 'rename'],
      mutationFn: payload => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  useSetLink: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { value: string }>({
      mutationKey: ['star', id, 'setLink'],
      mutationFn: payload => api.put(`/${id}`, { label: 'starLink', ...payload }),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
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
