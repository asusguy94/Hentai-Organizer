import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { useState } from 'react'

import {
  Grid,
  Card,
  CardActionArea,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { ImageCard } from '@components/image'
import { RegularHandlerProps, RegularItem } from '@components/indeterminate'
import { StarSearch as Star, HiddenStar as Hidden, getVisible } from '@components/search/helper'
import SortObj, { SortTypeStar as StarSort, SortMethodStar, getStarSort } from '@components/search/sort'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner'
import Link from '@components/link'

import { SetState } from '@interfaces'
import { serverConfig } from '@config'

import prisma from '@utils/server/prisma'
import { getUnique } from '@utils/shared'
import { searchService } from '@service'

import styles from './search.module.scss'

type StarData = Partial<{
  breasts: string[]
  haircolors: string[]
  hairstyles: string[]
  attributes: string[]
}>

export const getServerSideProps: GetServerSideProps<{
  breasts: string[]
  haircolors: string[]
  hairstyles: string[]
  attributes: string[]
}> = async () => {
  const breasts = await prisma.star.findMany({ where: { breast: { not: null } }, orderBy: { breast: 'asc' } })
  const haircolors = await prisma.star.findMany({ where: { haircolor: { not: null } }, orderBy: { haircolor: 'asc' } })
  const hairstyles = await prisma.star.findMany({ where: { hairstyle: { not: null } }, orderBy: { hairstyle: 'asc' } })
  const attributes = await prisma.attribute.findMany({ where: { videoOnly: false }, orderBy: { name: 'asc' } })

  return {
    props: {
      breasts: getUnique(breasts.flatMap(({ breast }) => (breast !== null ? [breast] : []))),
      haircolors: getUnique(haircolors.flatMap(({ haircolor }) => (haircolor !== null ? [haircolor] : []))),
      hairstyles: getUnique(hairstyles.flatMap(({ hairstyle }) => (hairstyle !== null ? [hairstyle] : []))),
      attributes: getUnique(attributes.map(({ name: attribute }) => attribute))
    }
  }
}

const StarSearchPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  attributes,
  breasts,
  haircolors,
  hairstyles
}) => {
  const [sort, setSort] = useState<StarSort>({ type: 'alphabetically', reverse: false })
  const [hidden, setHidden] = useState<Hidden>({
    titleSearch: '',
    breast: '',
    haircolor: '',
    hairstyle: '',
    attribute: []
  })

  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar
          attributes={attributes}
          breasts={breasts}
          haircolors={haircolors}
          hairstyles={hairstyles}
          setHidden={setHidden}
          setSort={setSort}
        />
      </Grid>

      <Grid item xs={10}>
        <Stars hidden={hidden} sortMethod={getStarSort(sort)} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type SidebarProps = {
  attributes: string[]
  breasts: string[]
  haircolors: string[]
  hairstyles: string[]
  setHidden: SetState<Hidden>
  setSort: SetState<StarSort>
}
const Sidebar = ({ attributes, breasts, haircolors, hairstyles, setHidden, setSort }: SidebarProps) => {
  return (
    <>
      <TitleSearch setHidden={setHidden} />

      <Sort setSort={setSort} />

      <Filter starData={{ breasts, haircolors, hairstyles, attributes }} setHidden={setHidden} />
    </>
  )
}

type StarsProps = {
  hidden: Hidden
  sortMethod: SortMethodStar
}
const Stars = ({ hidden, sortMethod }: StarsProps) => {
  const { data: stars } = searchService.useStars()

  if (stars === undefined) return <Spinner />

  const visible = getVisible(stars.sort(sortMethod), hidden)

  return (
    <div id={styles.stars}>
      <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Stars
      </Typography>

      <VGrid itemHeight={333} total={visible.length} renderData={idx => <StarCard star={visible[idx]} />} />
    </div>
  )
}

type StarCardProps = {
  star?: Star
}
const StarCard = ({ star }: StarCardProps) => {
  if (star === undefined) return null //FIXME cleanup is not working correctly

  return (
    <Link href={{ pathname: '/star/[id]', query: { id: star.id } }}>
      <Card className={styles.star}>
        <CardActionArea>
          <ImageCard
            src={`${serverConfig.api}/star/${star.id}/image`}
            width={200}
            height={275}
            missing={star.image === null}
            scale={5}
            alt={star.name}
          />

          <Grid container justifyContent='center' className={styles.title}>
            <Typography className='text-center'>{star.name}</Typography>
          </Grid>
        </CardActionArea>
      </Card>
    </Link>
  )
}

type SortProps = {
  setSort: SetState<StarSort>
}
const Sort = ({ setSort }: SortProps) => {
  const title = (reverse = false) => setSort({ type: 'alphabetically', reverse })
  const date = (reverse = false) => setSort({ type: 'added', reverse })
  const activity = (reverse = false) => setSort({ type: 'videos', reverse: !reverse })
  const lastActivity = (reverse = false) => setSort({ type: 'activity', reverse })

  return (
    <>
      <h2>Sort</h2>

      <FormControl>
        <RadioGroup name='sort' defaultValue='alphabetically'>
          <SortObj id='alphabetically' label={{ asc: 'A-Z', desc: 'Z-A' }} callback={title} />
          <SortObj id='added' label={{ asc: 'Oldest', desc: 'Newest' }} callback={date} reversed />
          <SortObj id='videos' label={{ asc: 'Least Active', desc: 'Most Active' }} callback={activity} reversed />
          <SortObj
            id='activity'
            label={{ asc: 'Oldest Activity', desc: 'Newest Activity' }}
            callback={lastActivity}
            reversed
          />
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterProps = {
  starData: StarData
  setHidden: SetState<Hidden>
}
const Filter = ({ starData, setHidden }: FilterProps) => {
  const breast = (target: string) => {
    setHidden(prev => ({ ...prev, breast: target.toLowerCase() }))
  }

  const haircolor = (target: string) => {
    setHidden(prev => ({ ...prev, haircolor: target.toLowerCase() }))
  }

  const hairstyle = (target: string) => {
    setHidden(prev => ({ ...prev, hairstyle: target.toLowerCase() }))
  }

  const attribute = (ref: RegularHandlerProps, target: string | undefined) => {
    if (target === undefined) throw new Error('target is undefined')

    const targetLower = target.toLowerCase()

    if (!ref.checked) {
      setHidden(prev => ({ ...prev, attribute: prev.attribute.filter(attribute => attribute !== targetLower) }))
    } else {
      setHidden(prev => ({ ...prev, attribute: [...prev.attribute, targetLower] }))
    }
  }

  const breast_ALL = () => {
    setHidden(prev => ({ ...prev, breast: '' }))
  }

  const haircolor_ALL = () => {
    setHidden(prev => ({ ...prev, haircolor: '' }))
  }

  const hairstyle_ALL = () => {
    setHidden(prev => ({ ...prev, hairstyle: '' }))
  }

  return (
    <>
      <FilterRadio data={starData.breasts} label='breast' callback={breast} globalCallback={breast_ALL} />
      <FilterRadio data={starData.haircolors} label='haircolor' callback={haircolor} globalCallback={haircolor_ALL} />
      <FilterRadio data={starData.hairstyles} label='hairstyle' callback={hairstyle} globalCallback={hairstyle_ALL} />

      <FilterCheckBox data={starData.attributes} label='attribute' callback={attribute} />
    </>
  )
}

type TitleSearchProps = {
  setHidden: SetState<Hidden>
}
const TitleSearch = ({ setHidden }: TitleSearchProps) => {
  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.currentTarget.value.toLowerCase()

    setHidden(prev => ({ ...prev, titleSearch: searchValue }))
  }

  return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} />
}

type FilterRadioProps = {
  data?: string[]
  label: string
  callback: (item: string) => void
  globalCallback?: () => void
}
const FilterRadio = ({ data, label, callback, globalCallback }: FilterRadioProps) => {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <RadioGroup name={label} defaultValue='ALL'>
          {globalCallback !== undefined && (
            <FormControlLabel
              value='ALL'
              label={<div className={styles.global}>ALL</div>}
              onChange={globalCallback}
              control={<Radio />}
            />
          )}

          {data.map(item => (
            <FormControlLabel
              key={item}
              value={item}
              onChange={() => callback(item)}
              label={item}
              control={<Radio />}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterCheckBoxProps = {
  data?: string[]
  label: string
  callback: (ref: RegularHandlerProps, item: string | undefined) => void
}
const FilterCheckBox = ({ data, label, callback }: FilterCheckBoxProps) => {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        {data.map(item => (
          <RegularItem key={item} label={item} value={item} item={item} callback={callback} />
        ))}
      </FormControl>
    </>
  )
}
export default StarSearchPage
