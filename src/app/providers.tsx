import React from 'react'

import { QueryClientProvider, QueryClient } from 'react-query'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnMount: 'always',
      staleTime: Infinity
    }
  }
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
