'use client'

import { useRouter } from 'next/navigation'
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

import Progress from './progress'

import { generateService, videoService } from '@service'

type AddVideoProps = {
  videos: { path: string; franchise: string; episode: number; name: string; slug: string }[]
}
export default function AddVideo({ videos }: AddVideoProps) {
  const router = useRouter()

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
                  router.refresh()
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
