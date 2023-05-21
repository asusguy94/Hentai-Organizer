import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import fs from 'fs'

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

import { generateService, videoService } from '@service'
import prisma from '@utils/server/prisma'
import { extOnly } from '@utils/server/helper'
import { generateEpisode, generateFranchise, generateName } from '@utils/server/generate'

export const getServerSideProps: GetServerSideProps<{
  videos: { path: string; franchise: string; episode: number; name: string }[]
}> = async () => {
  const filesDB = await prisma.video.findMany()
  const filesArray = filesDB.map(video => video.path)

  const files = await fs.promises.readdir('./media/videos')

  const maxFiles = 10
  const newFiles = []
  for (let idx = 0, fileCount = 0; fileCount < maxFiles && idx < files.length; idx++) {
    const file = files[idx]

    if (fileCount < maxFiles) {
      if (
        !filesArray.includes(file) &&
        (await fs.promises.lstat(`./media/videos/${file}`)).isFile() &&
        extOnly(`./media/videos/${file}`) === '.mp4' // prevent random files to be imported!
      ) {
        newFiles.push({
          path: file,
          franchise: generateFranchise(file),
          episode: generateEpisode(file),
          name: generateName(file)
        })

        fileCount++
      }
    }
  }

  return { props: { videos: newFiles } }
}

const AddVideoPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ videos }) => {
  const router = useRouter()

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>

      {videos.length === 0 ? (
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
