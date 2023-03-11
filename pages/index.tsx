import { NextPage } from 'next/types'

import { Grid } from '@mui/material'

import capitalize from 'capitalize'
import { useFetch } from 'usehooks-ts'

import { ResponsiveImage } from '@components/image'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Link from '@components/link'

import { serverConfig } from '@config'

import classes from './home.module.scss'

type ColumnProps = {
  enabled?: boolean
  label: string
  limit?: number
  rows?: number
  colSize?: number
}
export const Column = ({ label, rows = 1, colSize = 16 }: ColumnProps) => {
  type Video = {
    id: number
    name: string
    image: string | null
    total?: number
  }

  const limit = rows * colSize

  const { data } = useFetch<Video[]>(`${serverConfig.api}/home/${label}/${limit}`)
  if (data === undefined) return null

  return (
    <Grid container component='section' style={{ marginBottom: '0.5em' }}>
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>
        {capitalize(label)} (<span style={{ color: 'green' }}>{data.length}</span>)
      </h2>

      <Grid container spacing={2} columns={colSize}>
        {data.map((video, idx) => {
          const isMissing = video.image === null

          return (
            <Grid item xs={1} key={video.id} style={isMissing ? { textAlign: 'center' } : {}}>
              <Link
                href={{
                  pathname: '/video/[id]',
                  query: {
                    id: video.id
                  }
                }}
              >
                <RibbonContainer className={classes.video}>
                  <ResponsiveImage
                    src={`${serverConfig.api}/video/${video.id}/thumb`}
                    width={190}
                    height={275}
                    missing={isMissing}
                    className={classes.thumb}
                    alt='video'
                    priority={idx % colSize === 0}
                    sizes={`${100 / colSize}vw`}
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

const Home: NextPage = () => (
  <Grid container>
    <Column label='recent' />
    <Column label='newest' />
    <Column label='popular' rows={2} />
  </Grid>
)

export default Home
