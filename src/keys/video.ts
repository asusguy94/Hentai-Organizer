import { createQueryKeys } from '@lukemorales/query-key-factory'

export const videos = createQueryKeys('videos', {
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
  star: null,
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
