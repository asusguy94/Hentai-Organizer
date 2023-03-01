import { NextPage } from 'next/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

import { generateService, videoService } from '@service'

type Video = {
  path: string
  franchise: string
  episode: number
  name: string
}
const AddVideoPage: NextPage = () => {
  const router = useRouter()

  const { data: videos } = videoService.useNewVideos<Video>()

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>

      {videos !== undefined ? (
        !videos.length ? (
          <div className='text-center'>
            <Action label='Generate Metadata' callback={() => void generateService.meta()} />
            <Action label='Generate VTT' callback={() => void generateService.vtt()} />
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
                    <TableCell>path</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {videos.map(video => (
                    <TableRow key={video.path}>
                      <TableCell>{video.episode}</TableCell>
                      <TableCell>{video.franchise}</TableCell>
                      <TableCell>{video.name}</TableCell>
                      <TableCell>{video.path}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div style={{ marginTop: 8 }}>
              <Action
                label='Add Videos'
                callback={() => {
                  videoService.addVideos(videos).then(() => {
                    router.refresh()
                  })
                }}
              />
            </div>
          </>
        )
      ) : (
        <Spinner />
      )}
    </Grid>
  )
}

type ButtonProps = {
  label: string
  callback?: () => void
  disabled?: boolean
}
const Action = ({ label, callback, disabled = false }: ButtonProps) => {
  const [isDisabled, setIsDisabled] = useState(disabled)

  const clickHandler = () => {
    if (!isDisabled) {
      setIsDisabled(true)

      if (callback !== undefined) {
        callback()
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

export default AddVideoPage
