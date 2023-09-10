'use client'

import { useEffect, useRef } from 'react'

import { FormControl, Grid, RadioGroup, SelectChangeEvent, TextField } from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'

import { RegularHandlerProps } from '@components/indeterminate'
import { FilterCheckbox, FilterDropdown } from '@components/search/filter'
import { SortObjVideo as SortObj, defaultVideoObj as defaultObj, getSortString } from '@components/search/sort'

import Videos from './videos'

import { useAllSearchParams, useDynamicSearchParam, useSearchParam } from '@hooks/search'
import { General, Outfit } from '@interfaces'

import styles from './search.module.scss'

type VideoInfo = {
  categories: General[]
  attributes: General[]
  outfits: General[]
}

type VideoSearchPageProps = {
  videoInfo: VideoInfo
  brands: string[]
}
export default function VideoSearchPage({ videoInfo, brands }: VideoSearchPageProps) {
  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar videoInfo={videoInfo} brands={brands} />
      </Grid>

      <Grid item xs={10}>
        <Videos />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type SidebarProps = {
  videoInfo: VideoInfo
  brands: string[]
}
function Sidebar({ videoInfo, brands }: SidebarProps) {
  return (
    <>
      <TitleSearch />
      <Sort />
      <Filter videoInfo={videoInfo} brands={brands} />
    </>
  )
}

function TitleSearch() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { currentValue } = useSearchParam(defaultObj, 'query')

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.value = currentValue
      ref.current.focus()
    }
  }, [currentValue])

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
    if (reverse) {
      setParam('sort', '-alphabetical')
    } else {
      setParam('sort', 'alphabetical')
    }
    update()
  }

  const sortAdded = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-added')
    } else {
      setParam('sort', 'added')
    }
    update()
  }

  const sortDate = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-published')
    } else {
      setParam('sort', 'published')
    }
    update()
  }

  const sortPlays = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-plays')
    } else {
      setParam('sort', 'plays')
    }
    update()
  }

  const sortQuality = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-quality')
    } else {
      setParam('sort', 'quality')
    }
    update()
  }

  return (
    <>
      <h2>Sort</h2>

      <FormControl>
        <RadioGroup name='sort' defaultValue={getSortString(sort)}>
          <SortObj id='alphabetical' labels={['A-Z', 'Z-A']} callback={sortAlphabetical} />
          <SortObj id='added' labels={['Recent Upload', 'Old Upload']} callback={sortAdded} reversed />
          <SortObj id='published' labels={['Newest', 'Oldest']} callback={sortDate} reversed />
          <SortObj id='plays' labels={['Most Popular', 'Least Popular']} callback={sortPlays} reversed />
          <SortObj id='quality' labels={['Highest Quality', 'Lowest Quality']} callback={sortQuality} reversed />
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterProps = {
  videoInfo: VideoInfo
  brands: string[]
}
function Filter({ videoInfo: { attributes, categories, outfits }, brands }: FilterProps) {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const {
    category: categoryParam,
    outfit: outfitParam,
    attribute: attributeParam,
    nullCategory: nullCategoryParam
  } = useAllSearchParams(defaultObj)

  const category = (ref: RegularHandlerProps, target: General) => {
    const value = target.name

    if (categoryParam === defaultObj.category) {
      setParam('category', value)
    } else {
      const urlParam = categoryParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(category => category !== value)
        setParam('category', filtered.toString())
      } else {
        const merged = [...urlParam, value]
        setParam('category', merged.toString())
      }
    }
    update()
  }

  const attribute = (ref: RegularHandlerProps, target: General) => {
    const value = target.name

    if (attributeParam === defaultObj.attribute) {
      setParam('attribute', value)
    } else {
      const urlParam = attributeParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(attribute => attribute !== value)
        setParam('attribute', filtered.toString())
      } else {
        const merged = [...urlParam, value]
        setParam('attribute', merged.toString())
      }
    }
    update()
  }

  const outfit = (ref: RegularHandlerProps, target: Outfit) => {
    const value = target.name

    if (outfitParam === defaultObj.outfit) {
      setParam('outfit', value)
    } else {
      const urlParam = outfitParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(outfit => outfit !== value)
        setParam('outfit', filtered.toString())
      } else {
        const merged = [...urlParam, value]
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
