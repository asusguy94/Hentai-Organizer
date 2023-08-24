import { useMemo } from 'react'

import { Card, CardActionArea, Grid, Typography } from '@mui/material'

import { ImageCard } from '@components/image'
import Link from '@components/link'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import { isDefault } from '@components/search/filter'
import { defaultVideoObj as defaultObj, getVideoSort as getSort } from '@components/search/sort'
import Spinner from '@components/spinner'
import VGrid from '@components/virtualized/virtuoso'

import { defaultSettings, useSettings } from '../../settings/components'

import { serverConfig } from '@config'
import { useAllSearchParams } from '@hooks/search'
import { VideoSearch } from '@interfaces'
import { searchService } from '@service'

import styles from './search.module.scss'

export default function Videos() {
  const { sort, query, category, outfit, attribute, network, nullCategory, reverseSort } =
    useAllSearchParams(defaultObj)
  const { data: videos } = searchService.useVideos()

  const localSettings = useSettings()

  const filtered = useMemo<VideoSearch[]>(() => {
    const videoCount = localSettings?.video_count

    if (videos === undefined) return []
    if (videoCount === undefined || videoCount === defaultSettings.video_count) return videos

    return videos.filter((_, idx) => idx < videoCount)
  }, [localSettings?.video_count, videos])

  if (videos === undefined) return <Spinner />

  const visible = filtered
    .filter(v => !v.noStar)
    .sort(getSort(sort, reverseSort !== defaultObj.reverseSort))
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
    <Link href={`/video/${video.id}`}>
      <RibbonContainer component={Card} className={styles.video}>
        <CardActionArea>
          <ImageCard
            src={`${serverConfig.api}/video/${video.id}/cover`}
            width={210}
            height={275}
            missing={video.cover === null}
            scale={5}
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
