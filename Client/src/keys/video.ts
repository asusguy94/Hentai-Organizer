import { createQueryKeys } from '@lukemorales/query-key-factory'

export const videos = createQueryKeys('video', {
  byId: (id: number) => ({
    queryKey: [id],
    contextQueries: {
      validate: null,
      bookmark: null,
      star: null
    }
  }),
  new: null,
  all: null,
  related: {
    queryKey: null,
    contextQueries: {
      star: (id: number) => ({
        queryKey: [id]
      })
    }
  },
  home: (label: string, limit: number) => ({
    queryKey: [label, limit]
  })
})
