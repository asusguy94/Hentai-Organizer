import { FormControlLabel, Radio } from '@mui/material'

import { StarSearch, VideoSearch } from '@interfaces'

type SortObjProps<T extends DefaultObj> = {
  label: {
    asc: string
    desc: string
  }
  id: T['sort']
  callback: (reversed: boolean) => void
  reversed?: boolean
}
function SortObj<T extends DefaultObj>({ id, label, callback, reversed = false }: SortObjProps<T>) {
  return (
    <>
      <FormControlLabel
        label={reversed ? label.desc : label.asc}
        value={id}
        control={<Radio />}
        onChange={() => callback(reversed)}
      />
      <FormControlLabel
        label={reversed ? label.asc : label.desc}
        value={`${id}_desc`}
        control={<Radio />}
        onChange={() => callback(!reversed)}
      />
    </>
  )
}

export function SortObjVideo(params: SortObjProps<DefaultVideoObj>) {
  return <SortObj {...params} />
}

export function SortObjStar(params: SortObjProps<DefaultStarObj>) {
  return <SortObj {...params} />
}

type SortMethod<T> = (a: T, b: T) => number
export type SortMethodVideo = SortMethod<VideoSearch>
export type SortMethodStar = SortMethod<StarSearch>

type DefaultVideoObj = {
  category: string
  nullCategory: '0' | '1'
  attribute: string
  outfit: string
  network: string
  query: string
  sort: 'alphabetical' | 'added' | 'plays' | 'published' | 'quality'
  reverseSort: '0' | '1'
}

type DefaultStarObj = {
  breast: string
  haircolor: string
  hairstyle: string
  attribute: string
  query: string
  sort: 'alphabetical' | 'added' | 'videos' | 'activity'
  reverseSort: '0' | '1'
}

export const defaultVideoObj: DefaultVideoObj = {
  category: '',
  nullCategory: '0',
  attribute: '',
  outfit: '',
  network: 'ALL',
  query: '',
  sort: 'alphabetical',
  reverseSort: '0'
}

export const defaultStarObj: DefaultStarObj = {
  breast: 'ALL',
  haircolor: 'ALL',
  hairstyle: 'ALL',
  attribute: '',
  query: '',
  sort: 'alphabetical',
  reverseSort: '0'
}

export type DefaultObj = typeof defaultVideoObj | typeof defaultStarObj

export function getVideoSort(type: DefaultVideoObj['sort'], reverse = false): SortMethodVideo {
  let sortMethod: SortMethodVideo

  switch (type) {
    case 'added':
      sortMethod = (a, b) => a.id - b.id
      break
    case 'plays':
      sortMethod = (a, b) => a.plays - b.plays
      break
    case 'published':
      sortMethod = (a, b) => {
        if (a.published === null && b.published === null) return 0
        if (a.published === null) return 1
        if (b.published === null) return -1

        return new Date(a.published).getTime() - new Date(b.published).getTime()
      }
      break
    case 'quality':
      sortMethod = (a, b) => a.quality - b.quality
      break
    default:
      sortMethod = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'case' })
  }

  return reverse ? (a, b) => sortMethod(b, a) : sortMethod
}

export function getStarSort(type: DefaultStarObj['sort'], reverse = false): SortMethodStar {
  let sortMethod: SortMethodStar

  switch (type) {
    case 'added':
      sortMethod = (a, b) => a.id - b.id
      break
    case 'videos':
      sortMethod = (a, b) => a.videos.total - b.videos.total
      break
    case 'activity':
      sortMethod = (a, b) => {
        if (a.videos.last === null && b.videos.last === null) return 0
        if (a.videos.last === null) return 1
        if (b.videos.last === null) return -1

        return new Date(a.videos.last).getTime() - new Date(b.videos.last).getTime()
      }
      break
    default:
      sortMethod = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'case' })
  }

  return reverse ? (a, b) => sortMethod(b, a) : sortMethod
}
