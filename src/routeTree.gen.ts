/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as VideoSearchImport } from './routes/video/search'
import { Route as VideoVideoIdImport } from './routes/video/$videoId'
import { Route as StarStarIdImport } from './routes/star/$starId'

// Create Virtual Routes

const SettingsLazyImport = createFileRoute('/settings')()
const IndexLazyImport = createFileRoute('/')()
const VideoIndexLazyImport = createFileRoute('/video/')()
const EditorIndexLazyImport = createFileRoute('/editor/')()
const VideoAddLazyImport = createFileRoute('/video/add')()
const StarSearchLazyImport = createFileRoute('/star/search')()

// Create/Update Routes

const SettingsLazyRoute = SettingsLazyImport.update({
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/settings.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const VideoIndexLazyRoute = VideoIndexLazyImport.update({
  path: '/video/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/video/index.lazy').then((d) => d.Route))

const EditorIndexLazyRoute = EditorIndexLazyImport.update({
  path: '/editor/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/editor/index.lazy').then((d) => d.Route))

const VideoAddLazyRoute = VideoAddLazyImport.update({
  path: '/video/add',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/video/add.lazy').then((d) => d.Route))

const StarSearchLazyRoute = StarSearchLazyImport.update({
  path: '/star/search',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/star/search.lazy').then((d) => d.Route))

const VideoSearchRoute = VideoSearchImport.update({
  path: '/video/search',
  getParentRoute: () => rootRoute,
} as any)

const VideoVideoIdRoute = VideoVideoIdImport.update({
  path: '/video/$videoId',
  getParentRoute: () => rootRoute,
} as any)

const StarStarIdRoute = StarStarIdImport.update({
  path: '/star/$starId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      preLoaderRoute: typeof SettingsLazyImport
      parentRoute: typeof rootRoute
    }
    '/star/$starId': {
      preLoaderRoute: typeof StarStarIdImport
      parentRoute: typeof rootRoute
    }
    '/video/$videoId': {
      preLoaderRoute: typeof VideoVideoIdImport
      parentRoute: typeof rootRoute
    }
    '/video/search': {
      preLoaderRoute: typeof VideoSearchImport
      parentRoute: typeof rootRoute
    }
    '/star/search': {
      preLoaderRoute: typeof StarSearchLazyImport
      parentRoute: typeof rootRoute
    }
    '/video/add': {
      preLoaderRoute: typeof VideoAddLazyImport
      parentRoute: typeof rootRoute
    }
    '/editor/': {
      preLoaderRoute: typeof EditorIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/video/': {
      preLoaderRoute: typeof VideoIndexLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexLazyRoute,
  SettingsLazyRoute,
  StarStarIdRoute,
  VideoVideoIdRoute,
  VideoSearchRoute,
  StarSearchLazyRoute,
  VideoAddLazyRoute,
  EditorIndexLazyRoute,
  VideoIndexLazyRoute,
])

/* prettier-ignore-end */
