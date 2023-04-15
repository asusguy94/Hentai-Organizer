// Common types
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type General = {
  id: number
  name: string
}

// Other Types
type Related = {
  id: number
  name: string
  image: string | null
  plays: number
}

export type Video = {
  id: number
  name: string
  franchise: string
  brand: string | null
  episode: number
  duration: number
  noStar: boolean
  censored: boolean
  attributes: Attribute[]
  path: { file: string; stream: string }
  date: { added: string; published: string | null }
  quality: number
  related: Related[]
}

export type Attribute = {
  id: number
  name: string
}

export type Category = {
  id: number
  name: string
}

export type Outfit = {
  id: number
  name: string
}

export type VideoStar = {
  id: number
  name: string
  image: string | null
  attributes: Attribute[]
}

export type Bookmark = {
  id: number
  name: string
  starImage?: string
  starID: number
  start: number
  active: boolean
  attributes: Attribute[]
  outfit: string | null
}
