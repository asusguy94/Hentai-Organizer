import {
  Card,
  CardActionArea,
  CardMedia,
  FormControl,
  Grid,
  Link,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material'

import { createLazyFileRoute } from '@tanstack/react-router'
import ScrollToTop from 'react-scroll-to-top'

import MissingImage from '@/components/image/missing'
import { RegularHandlerProps } from '@/components/indeterminate'
import { FilterCheckbox, FilterRadio, isDefault } from '@/components/search/filter'
import {
  SortObjStar as SortObj,
  defaultStarObj as defaultObj,
  getStarSort as getSort,
  getSortString
} from '@/components/search/sort'
import Spinner from '@/components/spinner'
import VGrid from '@/components/virtualized/virtuoso'

import { serverConfig } from '@/config'
import { useAllSearchParams, useDynamicSearchParam, useSearchParam } from '@/hooks/search'
import useFocus from '@/hooks/useFocus'
import { StarSearch } from '@/interface'
import { searchService, starService } from '@/service'

import styles from './search.module.scss'

export const Route = createLazyFileRoute('/star/search')({
  component: () => (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <TitleSearch />
        <Sort />
        <Filter />
      </Grid>

      <Grid item xs={10}>
        <Stars />
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
        <RadioGroup name='sort' defaultValue={getSortString(sort)}>
          <SortObj id={defaultObj.sort} labels={['A-Z', 'Z-A']} callback={sortAlphabetical} />
          <SortObj id='added' labels={['Newest', 'Oldest']} callback={sortAdded} reversed />
          <SortObj id='videos' labels={['Most Active', 'Least Active']} callback={sortActivity} reversed />
          <SortObj id='activity' labels={['Newest Activity', 'Oldest Activity']} callback={sortLastActivity} reversed />
        </RadioGroup>
      </FormControl>
    </>
  )
}

function Filter() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { attribute: attributeParam } = useAllSearchParams(defaultObj)
  const { data: starData } = starService.useInfo()

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
        data={starData?.breast}
        label='breast'
        callback={breast}
        globalCallback={breast_ALL}
        defaultObj={defaultObj}
      />
      <FilterRadio
        data={starData?.haircolor}
        label='haircolor'
        callback={haircolor}
        globalCallback={haircolor_ALL}
        defaultObj={defaultObj}
      />
      <FilterRadio
        data={starData?.hairstyle}
        label='hairstyle'
        callback={hairstyle}
        globalCallback={hairstyle_ALL}
        defaultObj={defaultObj}
      />

      <FilterCheckbox data={starData?.attribute} label='attribute' callback={attribute} defaultObj={defaultObj} />
    </>
  )
}

function Stars() {
  const { breast, haircolor, hairstyle, attribute, query, sort } = useAllSearchParams(defaultObj)
  const { data: stars, isLoading } = searchService.useStars()

  if (isLoading || stars === undefined) return <Spinner />

  const visible = stars
    .sort(getSort(sort))
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || isDefault(query, defaultObj.query))
    .filter(s => s.breast === breast || isDefault(breast, defaultObj.breast))
    .filter(s => s.haircolor === haircolor || isDefault(haircolor, defaultObj.haircolor))
    .filter(s => s.hairstyle === hairstyle || isDefault(hairstyle, defaultObj.hairstyle))
    .filter(
      s => attribute.split(',').every(attr => s.attributes.includes(attr)) || isDefault(attribute, defaultObj.attribute)
    )

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
  star?: StarSearch
}
function StarCard({ star }: StarCardProps) {
  if (star === undefined) return null

  return (
    <Link href={`/star/${star.id}`}>
      <Card className={styles.star}>
        <CardActionArea>
          <CardMedia style={{ height: 275, textAlign: 'center' }}>
            {star.image === null ? (
              <MissingImage renderStyle='transform' scale={5} />
            ) : (
              <img
                src={`${serverConfig.newApi}/star/${star.id}/image`}
                alt='star'
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </CardMedia>

          <Grid container justifyContent='center' className={styles.title}>
            <Typography className='text-center'>{star.name}</Typography>
          </Grid>
        </CardActionArea>
      </Card>
    </Link>
  )
}
