import React from 'react'
import ReactDOM from 'react-dom/client'

import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'react-toastify'

import ErrorComponent from './components/error'
import ModalComponent from './components/modal'
import NotFoundComponent from './components/not-found'
import ModalContextProvider from './context/modalContext'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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
        <ModalContextProvider>
          <RouterProvider
            router={router}
            defaultErrorComponent={ErrorComponent}
            defaultNotFoundComponent={NotFoundComponent}
          />

          <ModalComponent />
        </ModalContextProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
}
