import { FormControlLabel, Radio } from '@mui/material'

import { StarSearch, VideoSearch } from '@/interface'

const reverseChar = '-'
function createReverse<T extends string>(sort: T) {
  return `${reverseChar}${sort}` as const
}

type SortObjProps<T extends DefaultObj> = {
  labels: [string, string]
  id: T['sort']
  callback: (reversed: boolean) => void
  reversed?: boolean
}
function SortObj<T extends DefaultObj>({ id, labels, callback, reversed = false }: SortObjProps<T>) {
  return (
    <>
      <FormControlLabel
        label={labels[0]}
        value={getSortString(reversed ? createReverse(id) : id)}
        control={<Radio />}
        onChange={() => callback(reversed)}
      />
      <FormControlLabel
        label={labels[1]}
        value={getSortString(!reversed ? createReverse(id) : id)}
        control={<Radio />}
        onChange={() => callback(!reversed)}
      />
    </>
  )
}

export function getSortString(sort: string, reverseSort = isReverseSort(sort)) {
  return reverseSort ? createReverse(sort) : sort
}

function isReverseSort(sort: string) {
  return sort.startsWith(reverseChar)
}

function getBaseSort<T extends string>(sort: T) {
  return sort.replace(new RegExp(`^${reverseChar}`), '') as WithoutReverse<T>
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

type WithReverse<T extends string> = T | ReturnType<typeof createReverse<T>>
type WithoutReverse<T extends string> = T extends ReturnType<typeof createReverse<infer U extends string>> ? U : T

type DefaultVideoObj = {
  category: string
  nullCategory: '0' | '1'
  attribute: string
  outfit: string
  network: string
  query: string
  sort: WithReverse<'alphabetical' | 'added' | 'published' | 'quality' | 'shuffle'>
  shuffle: string
}

type DefaultStarObj = {
  breast: string
  haircolor: string
  hairstyle: string
  attribute: string
  query: string
  sort: WithReverse<'alphabetical' | 'added' | 'videos' | 'activity'>
}

export const defaultVideoObj: DefaultVideoObj = {
  category: '',
  nullCategory: '0',
  attribute: '',
  outfit: '',
  network: 'ALL',
  query: '',
  sort: 'alphabetical',
  shuffle: ''
}

export const defaultStarObj: DefaultStarObj = {
  breast: 'ALL',
  haircolor: 'ALL',
  hairstyle: 'ALL',
  attribute: '',
  query: '',
  sort: 'alphabetical'
}

export type DefaultObj = DefaultVideoObj | DefaultStarObj

export function getVideoSort(type: DefaultVideoObj['sort']): SortMethodVideo {
  let sortMethod: SortMethodVideo

  switch (getBaseSort(type)) {
    case 'added':
      sortMethod = (a, b) => a.id - b.id
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
    case 'shuffle':
      sortMethod = () => Math.random() - 0.5
      break
    default:
      sortMethod = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'case' })
  }

  return isReverseSort(type) ? (a, b) => sortMethod(b, a) : sortMethod
}

export function getStarSort(type: DefaultStarObj['sort']): SortMethodStar {
  let sortMethod: SortMethodStar

  switch (getBaseSort(type)) {
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

  return isReverseSort(type) ? (a, b) => sortMethod(b, a) : sortMethod
}
