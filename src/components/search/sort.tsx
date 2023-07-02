import { FormControlLabel, Radio } from '@mui/material'

import { StarSearch as Star, VideoSearch as Video } from './helper'

type SortObjProps = {
  label: {
    asc: string
    desc: string
  }
  id: string
  callback: (reversed: boolean) => void
  reversed?: boolean
}
const SortObj = ({ id, label, callback, reversed = false }: SortObjProps) => (
  <>
    <FormControlLabel
      label={reversed ? label.desc : label.asc}
      value={id}
      control={<Radio />}
      onChange={() => callback(reversed)}
    />
    <FormControlLabel
      label={reversed ? label.asc : label.desc}
      value={`${id}_reverse`}
      control={<Radio />}
      onChange={() => callback(!reversed)}
    />
  </>
)

type Sort<T extends string> = { type: T; reverse?: boolean }

export type SortTypeVideo = Sort<'alphabetically' | 'added' | 'published' | 'plays' | 'quality' | 'shuffle'>
export type SortTypeStar = Sort<'alphabetically' | 'added' | 'videos' | 'activity'>
export type SortMethodVideo = (a: Video, b: Video) => number
export type SortMethodStar = (a: Star, b: Star) => number

export function getVideoSort(sort: SortTypeVideo): SortMethodVideo {
  let sortMethod: SortMethodVideo

  switch (sort.type) {
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
    case 'shuffle':
      sortMethod = () => Math.random() - 0.5
      break
    default:
      sortMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
  }

  return sort.reverse ? (a, b) => sortMethod(b, a) : sortMethod
}

export function getStarSort(sort: SortTypeStar): SortMethodStar {
  let sortMethod: SortMethodStar

  switch (sort.type) {
    case 'added':
      sortMethod = (a, b) => a.id - b.id
      break
    case 'videos':
      sortMethod = (a, b) => b.videos.total - a.videos.total
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
      sortMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
  }

  return sort.reverse ? (a, b) => sortMethod(b, a) : sortMethod
}

export default SortObj
