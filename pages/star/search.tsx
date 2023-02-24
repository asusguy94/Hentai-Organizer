import { NextPage } from 'next/types'
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
import { getVisible } from '@components/search/helper'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner'
import Link from '@components/link'
import SortObj, { type SortTypeStar as StarSort, type SortMethodStar, getStarSort } from '@components/search/sort'
import { type StarSearch as Star, type HiddenStar as Hidden } from '@components/search/helper'

import { SetState } from '@interfaces'
import { searchService, starService } from '@service'
import { serverConfig } from '@config'

import styles from './search.module.scss'

type StarData = Partial<{
  breasts: string[]
  haircolors: string[]
  hairstyles: string[]
  attributes: string[]
}>

const StarSearchPage: NextPage = () => {
  const { data: stars } = searchService.useStars()

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
        <Sidebar setHidden={setHidden} setSort={setSort} />
      </Grid>

      <Grid item xs={10}>
        <Stars stars={stars} hidden={hidden} sortMethod={getStarSort(sort)} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type SidebarProps = {
  setHidden: SetState<Hidden>
  setSort: SetState<StarSort>
}
const Sidebar = ({ setHidden, setSort }: SidebarProps) => {
  const { breast, haircolor, hairstyle, attribute } = starService.useInfo().data ?? {}

  return (
    <>
      <TitleSearch setHidden={setHidden} />

      <Sort setSort={setSort} />

      <Filter
        starData={{
          breasts: breast,
          haircolors: haircolor,
          hairstyles: hairstyle,
          attributes: attribute
        }}
        setHidden={setHidden}
      />
    </>
  )
}

type StarsProps = {
  stars?: Star[]
  hidden: Hidden
  sortMethod: SortMethodStar
}
const Stars = ({ stars = [], hidden, sortMethod }: StarsProps) => {
  const visible = getVisible(stars.sort(sortMethod), hidden)

  return (
    <div id={styles.stars}>
          <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Stars
          </Typography>

      {stars.length !== 0 ? (
        <VGrid itemHeight={333} total={visible.length} renderData={(idx: number) => <StarCard star={visible[idx]} />} />
      ) : (
        <Spinner />
      )}
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
            // unchecked >> checked
            star.hidden.attribute.push(targetLower)
          } else {
            // checked >> unchecked
            star.hidden.attribute.splice(star.hidden.attribute.indexOf(targetLower), 1)
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
