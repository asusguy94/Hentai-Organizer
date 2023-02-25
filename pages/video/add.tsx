import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'
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

import axios from 'axios'

import Spinner from '@components/spinner'

import { serverConfig } from '@config'

type Video = {
  path: string
  franchise: string
  episode: number
  name: string
}
const AddVideoPage: NextPage = () => {
  const router = useRouter()

  const [videos, setVideos] = useState<Video[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    axios
      .post(`${serverConfig.api}/video`)
      .then(({ data }) => setVideos(data))
      .finally(() => setLoaded(true))
  }, [])

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>

      {loaded ? (
        !videos.length ? (
          <div className='text-center'>
            <Action label='Generate Metadata' callback={() => void axios.post(`${serverConfig.api}/generate/meta`)} />
            <Action label='Generate VTT' callback={() => void axios.post(`${serverConfig.api}/generate/vtt`)} />
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
                  return void axios.post(`${serverConfig.api}/video/add`, { videos }).then(() => {
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
