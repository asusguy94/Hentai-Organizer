import { useMemo } from 'react'

import {
  Button,
  Card,
  CardActionArea,
  FormControl,
  Grid,
  RadioGroup,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'

import { Link, createFileRoute } from '@tanstack/react-router'
import ScrollToTop from 'react-scroll-to-top'

import { RegularHandlerProps } from '@/components/indeterminate'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import { FilterCheckbox, FilterDropdown, isDefault } from '@/components/search/filter'
import {
  SortObjVideo as SortObj,
  defaultVideoObj as defaultObj,
  getSortString,
  getVideoSort as getSort
} from '@/components/search/sort'
import { defaultSettings, useSettings } from '@/components/settings'
import Spinner from '@/components/spinner'
import VGrid from '@/components/virtualized/virtuoso'

import { serverConfig } from '@/config'
import { useAllSearchParams, useDynamicSearchParam, useSearchParam } from '@/hooks/search'
import useFocus from '@/hooks/useFocus'
import { VideoSearch } from '@/interface'
import { attributeService, brandService, categoryService, outfitService, searchService } from '@/service'

import styles from './search.module.scss'

export const Route = createFileRoute('/video/search')({
  component: () => (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <TitleSearch />
        <Sort />
        <Filter />
      </Grid>

      <Grid item xs={10}>
        <Videos />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
})

function TitleSearch() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { currentValue } = useSearchParam(defaultObj, 'query')

  const ref = useFocus(currentValue)

  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParam('query', e.target.value)
    update()
  }

  return <TextField inputRef={ref} variant='standard' placeholder='Name' onChange={callback} />
}

function Sort() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { sort } = useAllSearchParams(defaultObj)

  const sortAlphabetical = (reverse = false) => {
    setParam('shuffle', defaultObj.shuffle)
    if (reverse) {
      setParam('sort', '-alphabetical')
    } else {
      setParam('sort', 'alphabetical')
    }
    update()
  }

  const sortAdded = (reverse = false) => {
    setParam('shuffle', defaultObj.shuffle)
    if (reverse) {
      setParam('sort', '-added')
    } else {
      setParam('sort', 'added')
    }
    update()
  }

  const sortDate = (reverse = false) => {
    setParam('shuffle', defaultObj.shuffle)
    if (reverse) {
      setParam('sort', '-published')
    } else {
      setParam('sort', 'published')
    }
    update()
  }

  const sortQuality = (reverse = false) => {
    setParam('shuffle', defaultObj.shuffle)
    if (reverse) {
      setParam('sort', '-quality')
    } else {
      setParam('sort', 'quality')
    }
    update()
  }

  const shuffle = () => {
    setParam('sort', 'shuffle')
    setParam('shuffle', Date.now().toString())
    update()
  }

  return (
    <div>
      <h2>Sort</h2>

      <Button variant='contained' color='primary' size='small' onClick={shuffle}>
        Shuffle
      </Button>

      <div>
        <FormControl>
          <RadioGroup name='sort' defaultValue={getSortString(sort)}>
            <SortObj id='alphabetical' labels={['A-Z', 'Z-A']} callback={sortAlphabetical} />
            <SortObj id='added' labels={['Recent Upload', 'Old Upload']} callback={sortAdded} reversed />
            <SortObj id='published' labels={['Newest', 'Oldest']} callback={sortDate} reversed />
            <SortObj id='quality' labels={['Highest Quality', 'Lowest Quality']} callback={sortQuality} reversed />
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  )
}

function Filter() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const {
    category: categoryParam,
    outfit: outfitParam,
    attribute: attributeParam,
    nullCategory: nullCategoryParam
  } = useAllSearchParams(defaultObj)

  const { data: attributes } = attributeService.useAll()
  const { data: categories } = categoryService.useAll()
  const { data: outfits } = outfitService.useAll()
  const { data: brands } = brandService.useAll()

  const category = (ref: RegularHandlerProps, target: string) => {
    if (categoryParam === defaultObj.category) {
      setParam('category', target)
    } else {
      const urlParam = categoryParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(category => category !== target)
        setParam('category', filtered.toString())
      } else {
        const merged = [...urlParam, target]
        setParam('category', merged.toString())
      }
    }
    update()
  }

  const attribute = (ref: RegularHandlerProps, target: string) => {
    if (attributeParam === defaultObj.attribute) {
      setParam('attribute', target)
    } else {
      const urlParam = attributeParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(attribute => attribute !== target)
        setParam('attribute', filtered.toString())
      } else {
        const merged = [...urlParam, target]
        setParam('attribute', merged.toString())
      }
    }
    update()
  }

  const outfit = (ref: RegularHandlerProps, target: string) => {
    if (outfitParam === defaultObj.outfit) {
      setParam('outfit', target)
    } else {
      const urlParam = outfitParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(outfit => outfit !== target)
        setParam('outfit', filtered.toString())
      } else {
        const merged = [...urlParam, target]
        setParam('outfit', merged.toString())
      }
    }
    update()
  }

  const brand_DROP = (e: SelectChangeEvent) => {
    const value = e.target.value

    setParam('network', value)
    update()
  }

  const category_NULL = (ref: RegularHandlerProps) => {
    if (!ref.checked) {
      setParam('nullCategory', defaultObj.nullCategory)
    } else {
      setParam('nullCategory', '1')
    }
    update()
  }

  return (
    <>
      <FilterDropdown data={brands} label='network' callback={brand_DROP} defaultObj={defaultObj} />

      <FilterCheckbox
        data={categories}
        label='category'
        callback={category}
        nullCallback={category_NULL}
        defaultNull={nullCategoryParam !== defaultObj.nullCategory}
        defaultObj={defaultObj}
      />
      <FilterCheckbox data={outfits} label='outfit' callback={outfit} defaultObj={defaultObj} />
      <FilterCheckbox data={attributes} label='attribute' callback={attribute} defaultObj={defaultObj} />
    </>
  )
}

function Videos() {
  const { sort, query, category, outfit, attribute, network, nullCategory } = useAllSearchParams(defaultObj)
  const { data: videos, isLoading } = searchService.useVideos()

  const localSettings = useSettings()

  const filtered = useMemo<VideoSearch[]>(() => {
    const videoCount = localSettings?.video_count

    if (videos === undefined) return []
    if (videoCount === undefined || videoCount === defaultSettings.video_count) return videos

    return videos.filter((_, idx) => idx < videoCount)
  }, [localSettings?.video_count, videos])

  if (isLoading || videos === undefined) return <Spinner />

  const visible = filtered
    .filter(v => !v.noStar)
    .sort(getSort(sort))
    .filter(v => v.name.toLowerCase().includes(query.toLowerCase()) || isDefault(query, defaultObj.query))
    .filter(
      v => category.split(',').every(cat => v.categories.includes(cat)) || isDefault(category, defaultObj.category)
    )
    .filter(
      v =>
        (nullCategory !== defaultObj.nullCategory && v.categories.length === 0) ||
        isDefault(nullCategory, defaultObj.nullCategory)
    )
    .filter(v => outfit.split(',').every(out => v.outfits.includes(out)) || isDefault(outfit, defaultObj.outfit))
    .filter(
      v => attribute.split(',').every(attr => v.attributes.includes(attr)) || isDefault(attribute, defaultObj.attribute)
    )
    .filter(v => v.brand === network || isDefault(network, defaultObj.network))

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
  video?: VideoSearch
}
function VideoCard({ video }: VideoCardProps) {
  if (video === undefined) return null

  return (
    <Link to='/video/$videoId' params={{ videoId: video.id }}>
      <RibbonContainer component={Card} className={styles.video}>
        <CardActionArea>
          <img
            src={`${serverConfig.newApi}/video/${video.id}/cover`}
            // missing={video.cover === null}
            style={{ width: '100%', height: 'auto' }}
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
