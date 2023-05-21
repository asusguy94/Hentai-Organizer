import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
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
import { getVisible, HiddenVideo as Hidden, VideoSearch as Video, VideoSearch } from '@components/search/helper'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner'
import Link from '@components/link'
import SortObj, { getVideoSort, type SortMethodVideo, type SortTypeVideo as VideoSort } from '@components/search/sort'

import { Attribute as AttributeRef, Category, General, Outfit, SetState } from '@interfaces'

import { serverConfig } from '@config'
import prisma from '@utils/server/prisma'

import styles from './search.module.scss'
import { getUnique } from '@utils/shared'
import { formatDate } from '@utils/server/helper'

type Attribute = {
  videoOnly: boolean
  starOnly: boolean
} & AttributeRef

type VideoData = Partial<{
  categories: Category[]
  attributes: Attribute[]
  brands: string[]
  outfits: Outfit[]
}>

export const getServerSideProps: GetServerSideProps<{
  videos: VideoSearch[]
  categories: Category[]
  attributes: Attribute[]
  brands: string[]
  outfits: Outfit[]
}> = async () => {
  const videos = await prisma.video.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      noStar: true,
      cen: true,
      height: true,
      franchise: true,
      brand: true,
      name: true,
      date_published: true,
      plays: true,
      cover: true,
      bookmarks: {
        select: { category: true, outfit: true, attributes: { select: { attribute: { select: { name: true } } } } }
      },
      stars: {
        select: { star: { select: { attributes: { select: { attribute: { select: { name: true } } } } } } }
      }
    }
  })

  const categories = await prisma.category.findMany()
  const outfits = await prisma.outfit.findMany({ orderBy: { name: 'asc' } })
  const attributes = await prisma.attribute.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, videoOnly: true, starOnly: true }
  })
  const brands = await prisma.video.groupBy({
    where: { brand: { not: null } },
    by: ['brand'],
    orderBy: { brand: 'asc' }
  })

  return {
    props: {
      videos: videos.map(({ date_published, height, bookmarks, stars, ...video }) => ({
        ...video,
        plays: video.plays.length,
        quality: height,
        attributes: getUnique([
          ...stars.flatMap(({ star }) => star.attributes).map(({ attribute }) => attribute.name),
          ...bookmarks.flatMap(({ attributes }) => attributes).map(({ attribute }) => attribute.name)
        ]),
        published: date_published !== null ? formatDate(date_published, true) : null,
        categories: getUnique(bookmarks.map(({ category }) => category.name)),
        outfits: getUnique(bookmarks.flatMap(({ outfit }) => (outfit !== null ? [outfit.name] : [])))
      })),
      categories,
      attributes,
      brands: brands.flatMap(({ brand }) => (brand !== null ? [brand] : [])),
      outfits
    }
  }
}

const VideoSearchPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  videos,
  attributes,
  brands,
  categories,
  outfits
}) => {
  const [sort, setSort] = useState<VideoSort>({ type: 'alphabetically', reverse: false })
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
        <Sidebar
          attributes={attributes}
          brands={brands}
          categories={categories}
          outfits={outfits}
          setHidden={setHidden}
          setSort={setSort}
        />
      </Grid>

      <Grid item xs={10}>
        <Videos videos={videos} hidden={hidden} sortMethod={getVideoSort(sort)} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type VideosProps = {
  videos: VideoSearch[]
  hidden: Hidden
  sortMethod: SortMethodVideo
}
const Videos = ({ videos, hidden, sortMethod }: VideosProps) => {
  const visible = getVisible(videos.filter(v => !v.noStar).sort(sortMethod), hidden)

  return (
    <div id={styles.videos}>
      <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Videos
      </Typography>

      <VGrid itemHeight={385.375} total={visible.length} renderData={idx => <VideoCard video={visible[idx]} />} />
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

          {video.quality < 1080 && <Ribbon label={video.quality.toString()} />}
        </CardActionArea>
      </RibbonContainer>
    </Link>
  )
}

type SidebarProps = {
  attributes: Attribute[]
  brands: string[]
  categories: Category[]
  outfits: Outfit[]
  setHidden: SetState<Hidden>
  setSort: SetState<VideoSort>
}
const Sidebar = ({ attributes, brands, categories, outfits, setHidden, setSort }: SidebarProps) => {
  return (
    <>
      <TitleSearch setHidden={setHidden} />
      <Sort setSort={setSort} />
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

type SortProps = {
  setSort: SetState<VideoSort>
}
const Sort = ({ setSort }: SortProps) => {
  const shuffle = () => setSort({ type: 'shuffle', reverse: false })
  const sortDefault = (reverse = false) => setSort({ type: 'alphabetically', reverse })
  const sortAdded = (reverse = false) => setSort({ type: 'added', reverse })
  const sortDate = (reverse = false) => setSort({ type: 'published', reverse })
  const sortPlays = (reverse = false) => setSort({ type: 'plays', reverse })
  const sortQuality = (reverse = false) => setSort({ type: 'quality', reverse })

  return (
    <>
      <h2>Sort</h2>
      <Button variant='contained' onClick={shuffle} style={{ display: 'block' }}>
        Shuffle
      </Button>

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

  const category = (ref: RegularHandlerProps, target: Category) => {
    const targetLower = target.name.toLowerCase()

    if (!ref.checked) {
      setHidden(hidden => ({ ...hidden, category: hidden.category.filter(category => category !== targetLower) }))
    } else {
      setHidden(hidden => ({ ...hidden, category: [...hidden.category, targetLower] }))
    }
  }

  const attribute = (ref: RegularHandlerProps, target: Attribute) => {
    const targetLower = target.name.toLowerCase()

    if (!ref.checked) {
      setHidden(hidden => ({ ...hidden, attribute: hidden.attribute.filter(attribute => attribute !== targetLower) }))
    } else {
      setHidden(hidden => ({ ...hidden, attribute: [...hidden.attribute, targetLower] }))
    }
  }

  const outfits = (ref: RegularHandlerProps, target: Outfit) => {
    const targetLower = target.name.toLowerCase()

    if (!ref.checked) {
      setHidden(hidden => ({ ...hidden, outfit: hidden.outfit.filter(outfit => outfit !== targetLower) }))
    } else {
      setHidden(hidden => ({ ...hidden, outfit: [...hidden.outfit, targetLower] }))
    }
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
function FilterCheckBox<T extends General>({ data, label, callback }: FilterCheckboxProps<T>) {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        {data.map(item => (
          <RegularItem key={item.id} label={item.name} value={item.name} item={item} callback={callback} />
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
  if (data === undefined) return <Spinner />

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