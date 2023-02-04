import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

import {
  Button,
  Card,
  CardActionArea,
  FormControl,
  Grid,
  MenuItem,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { ImageCard } from '@components/image'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import LabelCount from '@components/labelcount'
import { RegularHandlerProps, RegularItem } from '@components/indeterminate'
import { getVisible } from '@components/search/helper'
import { FilterButton } from '@components/search/sidebar'
import VGrid from '@components/virtualized/virtuoso'
import Loader from '@components/loader'
import Link from '@components/link'
import SortObj from '@components/search/sort'

import { IAttribute as IAttributeRef, ICategory, IGeneral, IOutfit, ISetState } from '@interfaces'
import { attributeService, brandService, categoryService, outfitService, searchService } from '@service'

import { serverConfig } from '@config'

import styles from './search.module.scss'

interface IVideo {
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
  hidden: {
    category: string[]
    attribute: string[]
    outfit: string[]
    cen: boolean
    brand: boolean
    titleSearch: boolean
  }
}

interface IAttribute extends IAttributeRef {
  videoOnly: number
  starOnly: number
}

interface IVideoData {
  categories: ICategory[]
  attributes: IAttribute[]
  brands: string[]
  outfits: IOutfit[]
}

const VideoSearchPage: NextPage = () => {
  const { data } = searchService.useVideos<IVideo>()
  const [videos, setVideos] = useState<IVideo[]>([])

  useEffect(() => {
      setVideos(
      (data ?? [])
          .filter(video => !video.noStar)
          .map(video => ({
            ...video,
            hidden: {
              category: [],
              attribute: [],
              outfit: [],
              cen: false,
              brand: false,
            titleSearch: false
            }
          }))
      )
  }, [data])

  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar videos={videos} update={setVideos} />
      </Grid>

      <Grid item xs={10}>
        <Videos videos={videos} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

interface VideosProps {
  videos: IVideo[]
}
const Videos = ({ videos }: VideosProps) => {
  const visibleVideos = getVisible(videos)

  return (
    <div id={styles.videos}>
      {videos.length > 0 ? (
        <>
          <Typography variant='h6' className='text-center'>
            <span id={styles.count}>{visibleVideos.length}</span> Videos
          </Typography>

          <VGrid
            itemHeight={385.375}
            total={visibleVideos.length}
            renderData={(idx: number) => <VideoCard video={visibleVideos[idx]} />}
          />
        </>
      ) : (
        <Loader />
      )}
    </div>
  )
}

interface VideoCardProps {
  video?: IVideo
}
const VideoCard = ({ video }: VideoCardProps) => {
  if (video === undefined) return null //FIXME cleanup is not working correctly

  return (
    <Link href={{ pathname: '/video/[id]', query: { id: video.id } }}>
      <RibbonContainer component={Card} className={styles.video}>
        <CardActionArea>
          <ImageCard
            src={`${serverConfig.api}/video/${video.id}/thumb`}
            width={210}
            height={275}
            missing={video.cover === null}
            scale={5}
            alt='video'
          />

          <Grid container justifyContent='center' className={styles.title}>
            <Typography className='text-center'>{video.name}</Typography>
          </Grid>

          <Ribbon label={video.quality.toString()} />
        </CardActionArea>
      </RibbonContainer>
    </Link>
  )
}

interface SidebarProps {
  videos: IVideo[]
  update: ISetState<IVideo[]>
}
const Sidebar = ({ videos, update }: SidebarProps) => {
  const { data: categories } = categoryService.useCategories()
  const { data: attributes } = attributeService.useAttributes<IAttribute>()
  const { data: brands } = brandService.useBrands()
  const { data: outfits } = outfitService.useOutfits()

  return (
    <>
      <TitleSearch videos={videos} update={update} />

      <Sort videos={videos} update={update} />

      <Filter
        videos={videos}
        update={update}
        videoData={{
          categories: categories ?? [],
          attributes: attributes ?? [],
          brands: brands ?? [],
          outfits: outfits ?? []
        }}
      />
    </>
  )
}

interface TitleSearchProps {
  update: ISetState<IVideo[]>
  videos: IVideo[]
}
const TitleSearch = ({ update, videos }: TitleSearchProps) => {
  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase()

    update(
      videos.map(video => {
        video.hidden.titleSearch = !video.name.toLowerCase().includes(searchValue)

        return video
      })
    )
  }

  return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} />
}

interface SortProps {
  videos: IVideo[]
  update: ISetState<IVideo[]>
}
const Sort = ({ videos, update }: SortProps) => {
  const sortDefault = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
        return reverse ? result * -1 : result
      })
    )
  }

  const sortAdded = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.id - b.id
        return reverse ? result * -1 : result
      })
    )
  }

  // TODO when sorting by date, handle case where two episodes are released on the same date
  // usually this is for the same franchies, and so...should compare franchise and episode
  const sortDate = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        if (a.published === null && b.published === null) {
          return 0
        } else if (a.published === null) {
          return 1
        } else if (b.published === null) {
          return -1
        }

        const result = new Date(a.published).getTime() - new Date(b.published).getTime()
        return reverse ? result * -1 : result
      })
    )
  }

  const sortPlays = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.plays - b.plays
        return reverse ? result * -1 : result
      })
    )
  }

  const sortQuality = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.quality - b.quality
        return reverse ? result * -1 : result
      })
    )
  }

  return (
    <>
      <h2>Sort</h2>

      <FormControl>
        <RadioGroup name='sort' defaultValue='alphabetically'>
          <SortObj id='alphabetically' label={{ asc: 'A-Z', desc: 'Z-A' }} callback={sortDefault} />
          <SortObj id='added' label={{ asc: 'Old Upload', desc: 'Recent Upload' }} callback={sortAdded} reversed />
          <SortObj id='date' label={{ asc: 'Oldest', desc: 'Newest' }} callback={sortDate} reversed />
          <SortObj id='plays' label={{ asc: 'Least Popular', desc: 'Most Popular' }} callback={sortPlays} reversed />
          <SortObj
            id='quality'
            label={{ asc: 'Lowest Quality', desc: 'Highest Quality' }}
            callback={sortQuality}
            reversed
          />
        </RadioGroup>
      </FormControl>
    </>
  )
}

interface FilterProps {
  videoData: IVideoData
  videos: IVideo[]
  update: ISetState<IVideo[]>
}
const Filter = ({ videoData, videos, update }: FilterProps) => {
  const brand = (e: SelectChangeEvent) => {
    const targetLower = e.target.value.toLowerCase()

    update(
      [...videos].map(video => {
        if (targetLower === 'all') {
          video.hidden.brand = false
        } else if (targetLower === 'null') {
          video.hidden.brand = video.brand !== null
        } else {
          video.hidden.brand = video.brand === null || video.brand.toLowerCase() !== targetLower
        }

        return video
      })
    )
  }

  const censorship = (value: string) => {
    update(
      [...videos].map(video => {
        if (value === 'censored') {
          video.hidden.cen = !video.cen
        } else if (value === 'uncensored') {
          video.hidden.cen = video.cen
        } else {
          video.hidden.cen = false
        }

        return video
      })
    )
  }

  const category = (ref: RegularHandlerProps, target: ICategory) => {
    const targetLower = target.name.toLowerCase()

    update(
      videos.map(video => {
        const lowerSearch = video.categories.map(category => category.toLowerCase())

        if (!lowerSearch.includes(targetLower)) {
          if (!ref.checked) {
            // unchecked >> checked
            video.hidden.category.push(targetLower)
          } else {
            // checked >> unchecked
            video.hidden.category.splice(video.hidden.category.indexOf(targetLower), 1)
          }
        }

        return video
      })
    )
  }

  const attribute = (ref: RegularHandlerProps, target: IAttribute) => {
    const targetLower = target.name.toLowerCase()

    update(
      videos.map(video => {
        const lowerSearch = video.attributes.map(attribute => attribute.toLowerCase())

        if (!lowerSearch.includes(targetLower)) {
          if (!ref.checked) {
            // unchecked >> checked
            video.hidden.attribute.push(targetLower)
          } else {
            // checked >> unchecked
            video.hidden.attribute.splice(video.hidden.attribute.indexOf(targetLower), 1)
          }
        }

        return video
      })
    )
  }

  const outfits = (ref: RegularHandlerProps, target: IOutfit) => {
    const targetLower = target.name.toLowerCase()

    update(
      videos.map(video => {
        const lowerSearch = video.outfits.map(outfit => outfit.toLowerCase())

        if (!lowerSearch.includes(targetLower)) {
          if (!ref.checked) {
            // unchecked >> checked
            video.hidden.outfit.push(targetLower)
          } else {
            // checked >> unchecked
            video.hidden.outfit.splice(video.hidden.outfit.indexOf(targetLower), 1)
          }
        }

        return video
      })
    )
  }

  return (
    <>
      <FilterButton
        label='censorship'
        data={['censored', 'all', 'uncensored']}
        defaultValue='all'
        callback={censorship}
      />

      <FilterDropdown data={videoData.brands} label='network' callback={brand} nullCallback={brand} />

      <FilterCheckBox
        data={videoData.categories}
        obj={videos}
        label='category'
        labelPlural='categories'
        callback={category}
      />
      <FilterCheckBox data={videoData.outfits} obj={videos} label='outfit' callback={outfits} />
      <FilterCheckBox
        data={videoData.attributes}
        obj={videos}
        label='attribute'
        labelPlural='attributes'
        callback={attribute}
      />
    </>
  )
}

interface FilterCheckboxProps<T extends IGeneral> {
  data: T[]
  label: string
  labelPlural?: string
  obj: IVideo[]
  callback: (ref: RegularHandlerProps, item: T) => void
}
function FilterCheckBox<T extends IGeneral>({ data, label, labelPlural, obj, callback }: FilterCheckboxProps<T>) {
  return (
  <>
    <h2>{capitalize(label, true)}</h2>

    <FormControl>
      {data.map(item => (
          <RegularItem
          key={item.id}
          label={
            <>
              {item.name} <LabelCount prop={labelPlural ?? `${label}s`} label={item.name} obj={obj} />
            </>
          }
          value={item.name}
          item={item}
          callback={(ref, item) => callback(ref, item)}
        />
      ))}
    </FormControl>
  </>
)
}

interface FilterDropdownProps {
  data: string[]
  label: string
  labelPlural?: string
  callback: (e: SelectChangeEvent) => void
  nullCallback?: (e: any) => void
}
const FilterDropdown = ({ data, label, labelPlural, callback, nullCallback }: FilterDropdownProps) => (
  <>
    <h2>{capitalize(label, true)}</h2>

    <FormControl>
      <Select variant='standard' id={label} name={labelPlural ?? `${label}s`} defaultValue='ALL' onChange={callback}>
        <MenuItem value='ALL'>All</MenuItem>

        {nullCallback !== undefined && (
          <MenuItem value='NULL' onChange={nullCallback}>
            NULL
          </MenuItem>
        )}

        {data.map(item => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </>
)
export default VideoSearchPage
