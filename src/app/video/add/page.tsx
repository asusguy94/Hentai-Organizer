'use client'

import { useState } from 'react'

import {
  Grid,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Typography,
  Paper
} from '@mui/material'

import Spinner from '@components/spinner'

import Progress from './progress'

import { generateService, videoService } from '@service'

export default function AddVideo() {
  const { data: videos } = videoService.useNewVideos()

  if (videos === undefined) return <Spinner />

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>

      {videos.length === 0 ? (
        <div className='text-center'>
          <Action label='Generate Metadata' callback={generateService.meta} />
          <Action label='Generate VTT' callback={generateService.vtt} />

          <Progress />
        </div>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>episode</TableCell>
                  <TableCell>franchise</TableCell>
                  <TableCell>title</TableCell>
                  <TableCell>slug</TableCell>
                  <TableCell>path</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {videos.map(video => (
                  <TableRow key={video.path}>
                    <TableCell>{video.episode}</TableCell>
                    <TableCell>{video.franchise}</TableCell>
                    <TableCell>{video.name}</TableCell>
                    <TableCell>{video.slug}</TableCell>
                    <TableCell>{video.path}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: 8 }}>
            <Action
              label='Add Videos'
              callback={() =>
                videoService.addVideos(videos).then(() => {
                  location.reload()
                })
              }
            />
          </div>
        </>
      )}
    </Grid>
  )
}

type ButtonProps = {
  label: string
  callback?: () => Promise<unknown>
  disabled?: boolean
}
function Action({ label, callback, disabled = false }: ButtonProps) {
  const [isDisabled, setIsDisabled] = useState(disabled)

  const clickHandler = () => {
    if (!isDisabled) {
      setIsDisabled(true)

      if (callback !== undefined) {
        callback().then(() => setIsDisabled(false))
      }
    }
  }

  return (
    <Button
      variant='outlined'
      color='primary'
      disabled={isDisabled}
      onClick={clickHandler}
      style={{ marginLeft: 6, marginRight: 6 }}
    >
      {label}
    </Button>
  )
}
