import { createQueryKeys } from '@lukemorales/query-key-factory'

export const stars = createQueryKeys('stars', {
  byId: (id: number) => ({
    queryKey: [id],
    contextQueries: {
      video: null
    }
  }),
  info: null
})
