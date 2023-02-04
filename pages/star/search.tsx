import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

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
import LabelCount from '@components/labelcount'
import { getVisible } from '@components/search/helper'
import { FilterButton } from '@components/search/sidebar'
import VGrid from '@components/virtualized/virtuoso'
import Loader from '@components/loader'
import Link from '@components/link'
import SortObj from '@components/search/sort'

import { IStar, ISetState } from '@interfaces'
import { searchService, starService } from '@service'
import { serverConfig } from '@config'

import styles from './search.module.scss'

interface IStarData {
  breasts: string[]
  haircolors: string[]
  hairstyles: string[]
  attributes: string[]
}

const StarSearchPage: NextPage = () => {
  const { data } = searchService.useStars()
  const [stars, setStars] = useState<IStar[]>([])

  useEffect(() => {
    setStars(
      (data ?? []).map(star => ({
        ...star,
        hidden: {
          titleSearch: false,

          breast: false,
          haircolor: false,
          hairstyle: false,

          // Placeholder for temporary feature
          other: false,

          attribute: [],
          notAttribute: []
        }
      }))
    )
  }, [data])

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

interface SidebarProps {
  stars: IStar[]
  update: ISetState<IStar[]>
}
const Sidebar = ({ stars, update }: SidebarProps) => {
  const { breast, haircolor, hairstyle, attribute } = starService.useInfo().data ?? {}

  return (
    <>
      <TitleSearch stars={stars} update={update} />

      <Sort stars={stars} update={update} />

      <Filter
        stars={stars}
        update={update}
        starData={{
          breasts: breast ?? [],
          haircolors: haircolor ?? [],
          hairstyles: hairstyle ?? [],
          attributes: attribute ?? []
        }}
      />
    </>
  )
}

interface StarsProps {
  stars: IStar[]
}
const Stars = ({ stars }: StarsProps) => {
  const visibleStars = getVisible(stars)

  return (
    <div id={styles.stars}>
      {stars.length > 0 ? (
        <>
          <Typography variant='h6' className='text-center'>
            <span id={styles.count}>{visibleStars.length}</span> Stars
          </Typography>

          <VGrid
            itemHeight={333}
            total={visibleStars.length}
            renderData={(idx: number) => <StarCard star={visibleStars[idx]} />}
          />
        </>
      ) : (
        <Loader />
      )}
    </div>
  )
}

interface StarCardProps {
  star?: IStar
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

interface SortProps {
  stars: IStar[]
  update: ISetState<IStar[]>
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

interface FilterProps {
  stars: IStar[]
  starData: IStarData
  update: ISetState<IStar[]>
}
const Filter = ({ stars, starData, update }: FilterProps) => {
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
    update([
      ...stars.map(star => {
        star.hidden.breast = false

        return star
      })
    ])
  }

  const haircolor_ALL = () => {
    update([
      ...stars.map(star => {
        star.hidden.haircolor = false

        return star
      })
    ])
  }

  const hairstyle_ALL = () => {
    update([
      ...stars.map(star => {
        star.hidden.hairstyle = false

        return star
      })
    ])
  }

  const improvement = (value: 'numbered' | 'no-space' | 'all') => {
    update(
      [...stars].map(star => {
        if (value === 'numbered') {
          star.hidden.other = !/\d+$/.test(star.name)
        } else if (value === 'no-space') {
          star.hidden.other = star.name.includes(' ')
        } else {
          star.hidden.other = false
        }

        return star
      })
    )
  }

  return (
    <>
      <FilterButton label='FixName' data={['numbered', 'all', 'no-space']} defaultValue='all' callback={improvement} />

      <FilterRadio data={starData.breasts} obj={stars} label='breast' callback={breast} globalCallback={breast_ALL} />

      <FilterRadio
        data={starData.haircolors}
        obj={stars}
        label='haircolor'
        callback={haircolor}
        globalCallback={haircolor_ALL}
      />

      <FilterRadio
        data={starData.hairstyles}
        obj={stars}
        label='hairstyle'
        callback={hairstyle}
        globalCallback={hairstyle_ALL}
      />

      <FilterCheckBox
        data={starData.attributes}
        obj={stars}
        label='attribute'
        labelPlural='attributes'
        callback={attribute}
      />
    </>
  )
}

interface TitleSearchProps {
  stars: IStar[]
  update: ISetState<IStar[]>
}
const TitleSearch = ({ stars, update }: TitleSearchProps) => {
  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.currentTarget.value.toLowerCase()

    update(
      stars.map(star => {
        star.hidden.titleSearch = !star.name.toLowerCase().includes(searchValue)

        return star
      })
    )
  }

  return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} />
}

interface FilterRadioProps {
  data: string[]
  label: string
  obj: IStar[]
  callback: (item: string) => void
  globalCallback?: () => void
  count?: boolean
}
const FilterRadio = ({ data, label, obj, callback, globalCallback, count = true }: FilterRadioProps) => (
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
            label={
              <>
                {item} {count && <LabelCount prop={label} label={item} obj={obj} />}
              </>
            }
            control={<Radio />}
          />
        ))}
      </RadioGroup>
    </FormControl>
  </>
)

interface FilterCheckBoxProps {
  data: string[]
  label: string
  labelPlural: string
  obj: IStar[]
  callback: (ref: RegularHandlerProps, item: string | undefined) => void
}
const FilterCheckBox = ({ data, label, labelPlural, obj, callback }: FilterCheckBoxProps) => {
  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        {data.map(item => (
          <RegularItem
            key={item}
            label={
              <>
                {item} <LabelCount prop={labelPlural} label={item} obj={obj} />
              </>
            }
            value={item}
            item={item}
            callback={(ref, item) => callback(ref, item)}
          />
        ))}
      </FormControl>
    </>
  )
}
export default StarSearchPage
