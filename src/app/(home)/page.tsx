'use client'

import { Grid } from '@mui/material'

import capitalize from 'capitalize'

import { ResponsiveImage } from '@components/image'
import Link from '@components/link'
import Ribbon, { RibbonContainer } from '@components/ribbon'

import { serverConfig } from '@config'
import { videoService } from '@service'

import classes from './home.module.css'

type ColumnProps = {
  label: string
  cols: number
  rows?: number
}
function Column({ label, cols, rows = 1 }: ColumnProps) {
  const { data: videos } = videoService.useHomeVideos(label, rows * cols)

  if (videos === undefined) return null

  return (
    <Grid container component='section' style={{ marginBottom: '0.5em' }}>
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>
        {capitalize(label)} (<span style={{ color: 'green' }}>{videos.length}</span>)
      </h2>

      <Grid container spacing={2} columns={cols}>
        {videos.map(video => {
          const isMissing = video.image === null

          return (
            <Grid item xs={1} key={video.id} style={isMissing ? { textAlign: 'center' } : {}}>
              <Link href={`/video/${video.id}`}>
                <RibbonContainer className={classes.video}>
                  <ResponsiveImage
                    src={`${serverConfig.legacyApi}/video/${video.id}/cover`}
                    width={190}
                    height={275}
                    missing={isMissing}
                    className={classes.thumb}
                    alt='video'
                    sizes={`${100 / cols}vw`}
                  />

                  <div className={classes.title}>{video.name}</div>

                  {video.total !== undefined && <Ribbon label={video.total.toString()} />}
                </RibbonContainer>
              </Link>
            </Grid>
          )
        })}
      </Grid>
    </Grid>
  )
}

export default function HomePage() {
  return (
    <Grid container>
      <Column label='recent' cols={16} rows={2} />
      <Column label='newest' cols={16} rows={2} />
    </Grid>
  )
}
