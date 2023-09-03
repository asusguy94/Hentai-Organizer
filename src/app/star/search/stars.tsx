import { Card, CardActionArea, Grid, Link, Typography } from '@mui/material'

import { ImageCard } from '@components/image'
import { isDefault } from '@components/search/filter'
import { defaultStarObj as defaultObj, getStarSort as getSort } from '@components/search/sort'
import Spinner from '@components/spinner'
import VGrid from '@components/virtualized/virtuoso'

import { serverConfig } from '@config'
import { useAllSearchParams } from '@hooks/search'
import { StarSearch } from '@interfaces'
import { searchService } from '@service'

import styles from './search.module.scss'

export default function Stars() {
  const { breast, haircolor, hairstyle, attribute, query, sort, reverseSort } = useAllSearchParams(defaultObj)
  const { data: stars, isLoading } = searchService.useStars()

  if (isLoading || stars === undefined) return <Spinner />

  const visible = stars
    .sort(getSort(sort, reverseSort !== defaultObj.reverseSort))
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
