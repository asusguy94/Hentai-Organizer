import { createQueryKeys } from '@lukemorales/query-key-factory'

export const stars = createQueryKeys('star', {
  byId: (id: number) => ({
    queryKey: [id],
    contextQueries: {
      video: null
    }
  }),
  info: null
})
