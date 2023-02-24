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
  published: string | null
  quality: number
  plays: number
  attributes: string[]
  categories: string[]
  outfits: string[]
}
export type HiddenVideo = {
  titleSearch: string
  cen: boolean | null
  brand: string
  category: string[]
  attribute: string[]
  outfit: string[]
}
export type HiddenStar = {
  titleSearch: string
  breast: string
  haircolor: string
  hairstyle: string
  attribute: string[]
}

export interface HiddenProps<T extends IndexType<any> = IndexType<any>> {
  hidden: T
}

export function isHidden({ hidden }: HiddenProps) {
  for (const prop in hidden) {
    if (Array.isArray(hidden[prop])) {
      if (hidden[prop].length > 0) return true
    } else if (hidden[prop]) {
      return true
    }
  }

  return false
}

export function getVisible<T extends HiddenProps>(arr: T[]) {
  return arr.filter(item => !isHidden(item))
}
