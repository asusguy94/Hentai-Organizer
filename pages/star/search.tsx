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
  const { data } = searchService.useStars()
  const [stars, setStars] = useState<IStar[]>([])

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
        <Sidebar stars={stars} update={setStars} />
      </Grid>

      <Grid item xs={10}>
        <Stars stars={stars} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type SidebarProps = {
  setHidden: SetState<Hidden>
  setSort: SetState<StarSort>
}
const Sidebar = ({ stars, update }: SidebarProps) => {
  const { breast, haircolor, hairstyle, attribute } = starService.useInfo().data ?? {}

  return (
    <>
      <TitleSearch setHidden={setHidden} />

      <Sort stars={stars} update={update} />

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
const Stars = ({ stars }: StarsProps) => {
  const visibleStars = getVisible(stars)

  return (
    <div id={styles.stars}>
          <Typography variant='h6' className='text-center'>
            <span id={styles.count}>{visibleStars.length}</span> Stars
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
const Sort = ({ stars, update }: SortProps) => {
  const sortDefault = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
        return reverse ? result * -1 : result
      })
    )
  }

  const sortAdded = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.id - b.id
        return reverse ? result * -1 : result
      })
    )
  }

  const sortVideos = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.videos.total - b.videos.total
        return reverse ? result * -1 : result
      })
    )
  }

  const sortActivity = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = new Date(a.videos.last ?? 0).getTime() - new Date(b.videos.last ?? 0).getTime()
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
          <SortObj id='added' label={{ asc: 'Oldest', desc: 'Newest' }} callback={sortAdded} reversed />
          <SortObj id='videos' label={{ asc: 'Least Active', desc: 'Most Active' }} callback={sortVideos} reversed />
          <SortObj
            id='activity'
            label={{ asc: 'Oldest Activity', desc: 'Newest Activity' }}
            callback={sortActivity}
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
    update([
      ...stars.map(star => {
        star.hidden.breast = star.breast === null || star.breast.toLowerCase() !== target.toLowerCase()

        return star
      })
    ])
  }

  const haircolor = (target: string) => {
    update([
      ...stars.map(star => {
        star.hidden.haircolor = star.haircolor === null || star.haircolor.toLowerCase() !== target.toLowerCase()

        return star
      })
    ])
  }

  const hairstyle = (target: string) => {
    update([
      ...stars.map(star => {
        star.hidden.hairstyle = star.hairstyle === null || star.hairstyle.toLowerCase() !== target.toLowerCase()

        return star
      })
    ])
  }

  const attribute = (ref: RegularHandlerProps, target: string | undefined) => {
    if (target === undefined) throw new Error('target is undefined')

    const targetLower = target.toLowerCase()

    update(
      stars.map(star => {
        const lowerSearch = star.attributes.map(attribute => attribute.toLowerCase())

        if (!lowerSearch.includes(targetLower)) {
          if (!ref.checked) {
            // unchecked >> checked
            star.hidden.attribute.push(targetLower)
          } else {
            // checked >> unchecked
            star.hidden.attribute.splice(star.hidden.attribute.indexOf(targetLower), 1)
          }
        }

        return star
      })
    )
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
