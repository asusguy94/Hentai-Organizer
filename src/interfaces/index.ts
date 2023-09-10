// Common types
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export type General = {
  id: number
  name: string
}

export type ServerAction = (data: FormData) => Promise<void>
export type StaticParams<T extends string | string[]> = Promise<Record<T extends string ? T : T[number], string>[]>
export type Params<T extends string | string[]> = {
  params: Record<T extends string ? T : T[number], string>
}

export type AllowString<T> = T | (string & NonNullable<unknown>)

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
  slug: string | null
  episode: number
  duration: number
  noStar: boolean
  censored: boolean
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

export type Validity = {
  title: boolean
  fname: boolean
}

export type StarSearch = {
  id: number
  name: string
  image: string | null
  breast: string | null
  haircolor: string | null
  hairstyle: string | null
  attributes: string[]
  videos: {
    total: number
    last: string | null
  }
}

export type VideoSearch = {
  id: number
  name: string
  franchise: string
  brand: string | null
  noStar: boolean
  cen: boolean
  cover: string | null
  slug: string | null
  poster: string | null
  published: string | null
  quality: number
  plays: number
  attributes: string[]
  categories: string[]
  outfits: string[]
}
