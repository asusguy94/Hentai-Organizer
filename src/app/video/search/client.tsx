'use client'

import { useEffect, useRef } from 'react'

import { FormControl, Grid, RadioGroup, SelectChangeEvent, TextField } from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'

import { RegularHandlerProps } from '@components/indeterminate'
import { FilterCheckbox, FilterDropdown } from '@components/search/filter'
import { SortObjVideo as SortObj, defaultVideoObj as defaultObj } from '@components/search/sort'

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
  const { sort, reverseSort } = useAllSearchParams(defaultObj)

  const sortAlphabetical = (reverse = false) => {
    setParam('sort', 'alphabetical')
    setParam('reverseSort', Number(reverse).toString())
    update()
  }

  const sortAdded = (reverse = false) => {
    setParam('sort', 'added')
    setParam('reverseSort', Number(reverse).toString())
    update()
  }

  const sortDate = (reverse = false) => {
    setParam('sort', 'published')
    setParam('reverseSort', Number(reverse).toString())
    update()
  }

  const sortPlays = (reverse = false) => {
    setParam('sort', 'plays')
    setParam('reverseSort', Number(reverse).toString())
    update()
  }

  const sortQuality = (reverse = false) => {
    setParam('sort', 'quality')
    setParam('reverseSort', Number(reverse).toString())
    update()
  }

  return (
    <>
      <h2>Sort</h2>

      <FormControl>
        <RadioGroup
          name='sort'
          defaultValue={
            sort !== defaultObj.sort
              ? reverseSort !== defaultObj.reverseSort
                ? `${sort}_desc`
                : sort
              : defaultObj.sort
          }
        >
          <SortObj id='alphabetical' label={{ asc: 'A-Z', desc: 'Z-A' }} callback={sortAlphabetical} />
          <SortObj id='added' label={{ asc: 'Old Upload', desc: 'Recent Upload' }} callback={sortAdded} reversed />
          <SortObj id='published' label={{ asc: 'Oldest', desc: 'Newest' }} callback={sortDate} reversed />
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
