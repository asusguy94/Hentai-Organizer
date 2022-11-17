import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

import { Grid } from '@mui/material'

import axios from 'axios'
import capitalize from 'capitalize'

import { ResponsiveImage } from '@components/image'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Link from '@components/link'

import { serverConfig } from '@config'

import classes from './home.module.scss'

interface ColumnProps {
  enabled?: boolean
  label: string
  limit?: number
  rows?: number
  colSize?: number
}
export const Column = ({ enabled = true, label, rows = 1, colSize = 16 }: ColumnProps) => {
  interface IVideo {
    id: number
    name: string
    image: string | null
    total?: number
  }

  const [data, setData] = useState<IVideo[]>([])

  const limit = rows * colSize
  useEffect(() => {
    if (enabled) {
      axios.get(`${serverConfig.api}/home/${label}/${limit}`).then(({ data }) => setData(data))
    }
  }, [enabled, label, limit])

  if (!data.length) return null

  return (
    <Grid container component='section' style={{ marginBottom: '0.5em' }}>
      <h2
        style={{
          marginTop: 0,
          marginBottom: 0
        }}
      >
        {capitalize(label)} (
        <span
          style={{
            color: 'green'
          }}
        >
          {data.length}
        </span>
        )
      </h2>

      <Grid container spacing={2} columns={colSize}>
        {data.map((video, i) => {
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
                    priority={i % colSize === 0}
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