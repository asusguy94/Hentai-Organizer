import { NextPage } from 'next/types'
import { useState } from 'react'

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
import { RegularHandlerProps, RegularItem } from '@components/indeterminate'
import { getVisible, HiddenVideo as Hidden, VideoSearch as Video } from '@components/search/helper'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner'
import Link from '@components/link'
import SortObj from '@components/search/sort'

import { Attribute as AttributeRef, Category, General, Outfit, SetState } from '@interfaces'
import { attributeService, brandService, categoryService, outfitService, searchService } from '@service'

import { serverConfig } from '@config'

import styles from './search.module.scss'

type Attribute = {
  videoOnly: number
  starOnly: number
} & AttributeRef

type VideoData = Partial<{
  categories: Category[]
  attributes: Attribute[]
  brands: string[]
  outfits: Outfit[]
}>

const VideoSearchPage: NextPage = () => {
  const { data } = searchService.useVideos<IVideo>()
  const [videos, setVideos] = useState<IVideo[]>([])

  const [hidden, setHidden] = useState<Hidden>({
    titleSearch: '',
    cen: null,
    brand: '',
              category: [],
              attribute: [],
    outfit: []
  })

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
        <Spinner />
      )}
    </div>
  )
}

type VideoCardProps = {
  video?: Video
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
  const { data: attributes } = attributeService.useAttributes<Attribute>()
  const { data: brands } = brandService.useBrands()
  const { data: outfits } = outfitService.useOutfits()

  return (
    <>
      <TitleSearch setHidden={setHidden} />
      <Filter videoData={{ categories, attributes, brands, outfits }} setHidden={setHidden} />
    </>
  )
}

type TitleSearchProps = {
  setHidden: SetState<Hidden>
}
const TitleSearch = ({ setHidden }: TitleSearchProps) => {
  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase()

    setHidden(hidden => ({ ...hidden, titleSearch: searchValue }))
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

type FilterProps = {
  videoData: VideoData
  setHidden: SetState<Hidden>
}
const Filter = ({ videoData, setHidden }: FilterProps) => {
  const brand = (e: SelectChangeEvent) => {
    const targetLower = e.target.value.toLowerCase()

        if (targetLower === 'all') {
      setHidden(hidden => ({ ...hidden, brand: '' }))
        } else {
      setHidden(hidden => ({ ...hidden, brand: targetLower }))
        }
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
      <FilterDropdown data={videoData.brands} label='network' callback={brand} />

      <FilterCheckBox data={videoData.categories} label='category' callback={category} />
      <FilterCheckBox data={videoData.outfits} label='outfit' callback={outfits} />
      <FilterCheckBox data={videoData.attributes} label='attribute' callback={attribute} />
    </>
  )
}

type FilterCheckboxProps<T extends General> = {
  data?: T[]
  label: string
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
            label={item.name}
          value={item.name}
          item={item}
          callback={(ref, item) => callback(ref, item)}
        />
      ))}
    </FormControl>
  </>
)
}

type FilterDropdownProps = {
  data?: string[]
  label: string
  labelPlural?: string
  callback: (e: SelectChangeEvent) => void
}
const FilterDropdown = ({ data, label, labelPlural, callback }: FilterDropdownProps) => {
  return (
  <>
    <h2>{capitalize(label, true)}</h2>

    <FormControl>
      <Select variant='standard' id={label} name={labelPlural ?? `${label}s`} defaultValue='ALL' onChange={callback}>
        <MenuItem value='ALL'>All</MenuItem>

        {data.map(item => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </>
)
}
export default VideoSearchPage
