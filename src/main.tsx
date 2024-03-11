import React from 'react'
import ReactDOM from 'react-dom/client'

import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'react-toastify'

import { routeTree } from './routeTree.gen'

import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const onError = () => {
  toast.error('Network Error', { autoClose: false })
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: 'always',
      staleTime: Infinity
    }
  },
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError })
})

const root = document.getElementById('root')
if (root === null) {
  throw new Error('root element not found')
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={client}>
        <RouterProvider
          router={router}
          defaultErrorComponent={({ error }: { error: Error }) => (
            <div>
              <h1>{error.message}</h1>
              <pre>{error.stack}</pre>
            </div>
          )}
        />
      </QueryClientProvider>
    </React.StrictMode>
  )
}