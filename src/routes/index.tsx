import { Grid } from '@mui/material'

import { Link, createFileRoute } from '@tanstack/react-router'
import capitalize from 'capitalize'

import MissingImage from '@/components/image/missing'
import Ribbon, { RibbonContainer } from '@/components/ribbon'

import { serverConfig } from '@/config'
import { videoService } from '@/service'

export const Route = createFileRoute('/')({
  component: () => (
    <Grid container>
      <Column label='recent' cols={16} rows={2} />
      <Column label='newest' cols={16} rows={2} />
    </Grid>
  )
})

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
      <h2>
        {capitalize(label)} (<span style={{ color: 'green' }}>{videos.length}</span>)
      </h2>

      <Grid container spacing={2} columns={cols}>
        {videos.map(video => (
          <Grid item xs={1} key={video.id}>
            <Link to='/video/$videoId' params={{ videoId: video.id }}>
              <RibbonContainer style={{ textAlign: 'center' }}>
                {video.image === null ? (
                  <MissingImage />
                ) : (
                  <img
                    src={`${serverConfig.newApi}/video/${video.id}/cover`}
                    alt='video'
                    style={{
                      width: '100%',
                      height: 'auto',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.25rem'
                    }}
                  />
                )}

                <div
                  style={{
                    textAlign: 'center',
                    color: 'black',
                    // Restrict to 3 lines
                    WebkitLineClamp: 3,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {video.name}
                </div>

                {video.total !== undefined && <Ribbon label={video.total.toString()} />}
              </RibbonContainer>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Grid>
  )
}
