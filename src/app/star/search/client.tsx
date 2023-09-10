'use client'

import { useEffect, useRef } from 'react'

import { Grid, TextField, FormControl, RadioGroup } from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'

import { RegularHandlerProps } from '@components/indeterminate'
import { FilterCheckbox, FilterRadio } from '@components/search/filter'
import { SortObjStar as SortObj, defaultStarObj as defaultObj, getSortString } from '@components/search/sort'

import Stars from './stars'

import { useAllSearchParams, useDynamicSearchParam, useSearchParam } from '@hooks/search'

import styles from './search.module.scss'

type StarData = {
  breasts: string[]
  haircolors: string[]
  hairstyles: string[]
  attributes: string[]
}

type StarSearchProps = {
  starData: StarData
}

export default function StarSearchPage({ starData }: StarSearchProps) {
  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar starData={starData} />
      </Grid>

      <Grid item xs={10}>
        <Stars />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type SidebarProps = {
  starData: StarData
}
function Sidebar({ starData }: SidebarProps) {
  return (
    <>
      <TitleSearch />
      <Sort />
      <Filter starData={starData} />
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
    setParam('query', e.currentTarget.value)
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

  const sortActivity = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-videos')
    } else {
    setParam('sort', 'videos')
    }
    update()
  }

  const sortLastActivity = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-activity')
    } else {
    setParam('sort', 'activity')
    }
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
          <SortObj id={defaultObj.sort} label={{ asc: 'A-Z', desc: 'Z-A' }} callback={sortAlphabetical} />
          <SortObj id='added' label={{ asc: 'Oldest', desc: 'Newest' }} callback={sortAdded} reversed />
          <SortObj id='videos' label={{ asc: 'Least Active', desc: 'Most Active' }} callback={sortActivity} reversed />
          <SortObj
            id='activity'
            label={{ asc: 'Oldest Activity', desc: 'Newest Activity' }}
            callback={sortLastActivity}
            reversed
          />
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterProps = {
  starData: StarData
}
function Filter({ starData: { attributes, breasts, haircolors, hairstyles } }: FilterProps) {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { attribute: attributeParam } = useAllSearchParams(defaultObj)

  const breast = (target: string) => {
    if (target === defaultObj.breast) {
      setParam('breast', defaultObj.breast)
    } else {
      setParam('breast', target)
    }
    update()
  }

  const haircolor = (target: string) => {
    if (target === defaultObj.haircolor) {
      setParam('haircolor', defaultObj.haircolor)
    } else {
      setParam('haircolor', target)
    }
    update()
  }

  const hairstyle = (target: string) => {
    if (target === defaultObj.hairstyle) {
      setParam('hairstyle', defaultObj.hairstyle)
    } else {
      setParam('hairstyle', target)
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

  const breast_ALL = () => {
    setParam('breast', defaultObj.breast)
    update()
  }

  const haircolor_ALL = () => {
    setParam('haircolor', defaultObj.haircolor)
    update()
  }

  const hairstyle_ALL = () => {
    setParam('hairstyle', defaultObj.hairstyle)
    update()
  }

  return (
    <>
      <FilterRadio
        data={breasts}
        label='breast'
        callback={breast}
        globalCallback={breast_ALL}
        defaultObj={defaultObj}
      />
      <FilterRadio
        data={haircolors}
        label='haircolor'
        callback={haircolor}
        globalCallback={haircolor_ALL}
        defaultObj={defaultObj}
      />
      <FilterRadio
        data={hairstyles}
        label='hairstyle'
        callback={hairstyle}
        globalCallback={hairstyle_ALL}
        defaultObj={defaultObj}
      />

      <FilterCheckbox data={attributes} label='attribute' callback={attribute} defaultObj={defaultObj} />
    </>
  )
}
