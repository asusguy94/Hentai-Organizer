// Common types
export type ISetState<T> = React.Dispatch<React.SetStateAction<T>>
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Common interface
export interface IGeneral {
  id: number
  name: string
}

export type IndexType<V = any> = Record<string, V>

// Other Interfaces
interface IRelated {
  id: number
  name: string
  image: string | null
  plays: number
}

export interface IVideo {
  id: number
  name: string
  franchise: string
  brand: string | null
  episode: number
  duration: number
  noStar: boolean
  censored: boolean
  attributes: IAttribute[]
  path: { file: string; stream: string }
  date: { added: string; published: string | null }
  quality: number
  related: IRelated[]
}

export interface IAttribute {
  id: number
  name: string
}

export interface ICategory {
  id: number
  name: string
}

export interface IOutfit {
  id: number
  name: string
}

export interface IVideoStar {
  id: number
  name: string
  image: string | null
  attributes: IAttribute[]
}

export interface IBookmark {
  id: number
  name: string
  starImage?: string
  starID: number
  start: number
  active: boolean
  attributes: IAttribute[]
  outfit: string | null
}

export interface IStar {
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
  hidden: {
    titleSearch: boolean

    breast: boolean
    haircolor: boolean
    hairstyle: boolean

    other: boolean

    attribute: string[]
    notAttribute: string[]
  }
}
