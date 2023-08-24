'use client'

import React from 'react'

import { QueryClientProvider, QueryClient } from 'react-query'

const client = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
