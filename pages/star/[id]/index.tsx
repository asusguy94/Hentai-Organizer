import { NextPage } from 'next/types'
import React, { Fragment, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'

import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Autocomplete
} from '@mui/material'

import axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

import Image from '@components/image'
import Link from '@components/link'
import Modal, { IModalHandler, useModal } from '@components/modal'
import Loader from '@components/loader'
import Dropbox from '@components/dropbox'
import Icon from '@components/icon'

import { ISetState } from '@interfaces'
import { serverConfig } from '@config'

import styles from './star.module.scss'

interface IStarVideo {
  id: number
  name: string
  fname: string
}

interface IStar {
  id: number
  name: string
  image: string | null
  info: {
    breast: string
    haircolor: string
    hairstyle: string
    attribute: any[]
  }
  link: string | null
}

const StarPage: NextPage = () => {
  const { query } = useRouter()

  const { modal, setModal } = useModal()

  const [star, setStar] = useState<IStar>()
  const [videos, setVideos] = useState<IStarVideo[]>([])

  useEffect(() => {
    if (typeof query.id === 'string') {
      const id = parseInt(query.id)

      axios.get<IStar>(`${serverConfig.api}/star/${id}`).then(({ data }) => {
        setStar(data)
      })

      axios.get<IStarVideo[]>(`${serverConfig.api}/star/${id}/video`).then(({ data }) => {
        setVideos(data)
      })
    }
  }, [query.id])

  return (
    <Grid container>
      <Grid item xs={6}>
        {star !== undefined ? (
          <div id={styles.star}>
            <StarImageDropbox star={star} videos={videos} update={setStar} />

            <StarTitle star={star} onModal={setModal} update={setStar} />

            <StarForm star={star} update={setStar} />

            <StarVideos videos={videos} />
          </div>
        ) : (
          <Loader />
        )}

        <Modal visible={modal.visible} title={modal.title} filter={modal.filter} onClose={setModal}>
          {modal.data}
        </Modal>
      </Grid>
    </Grid>
  )
}

interface StarVideosProps {
  videos: IStarVideo[]
}
const StarVideos = ({ videos }: StarVideosProps) => {
  if (videos.length === 0) return null

  return (
    <Grid container>
      <h3>Videos</h3>

      <Grid container id={styles.videos}>
        {videos.map(video => (
          <StarVideo key={video.id} video={video} />
        ))}
      </Grid>
    </Grid>
  )
}

interface StarFormProps {
  star: IStar
  update: ISetState<IStar | undefined>
}
const StarForm = ({ star, update }: StarFormProps) => {
  interface IStarData {
    breast: string[]
    haircolor: string[]
    hairstyle: string[]
    attribute: string[]
  }

  const [starData, setStarData] = useState<IStarData>()

  useEffect(() => {
    axios.get<IStarData>(`${serverConfig.api}/star`).then(({ data }) => {
      setStarData(data)
    })
  }, [])

  const addAttribute = (name: string) => {
    axios.put(`${serverConfig.api}/star/${star.id}/attribute`, { name }).then(() => {
      update({
        ...star,
        info: { ...star.info, attribute: [...star.info.attribute, name] }
      })
    })
  }

  const removeAttribute = (name: string) => {
    axios
      .put(`${serverConfig.api}/star/${star.id}/attribute`, {
        name,
        remove: true
      })
      .then(() => {
        update({
          ...star,
          info: {
            ...star.info,
            attribute: star.info.attribute.filter((attribute: any) => {
              if (attribute.toLowerCase() === name.toLowerCase()) return null

              return attribute
            })
          }
        })
      })
  }

  const updateInfo = (value: string, label: string) => {
    axios.put(`${serverConfig.api}/star/${star.id}`, { label, value }).then(() => {
      update({ ...star, info: { ...star.info, [label]: value } })
    })
  }

  if (starData === undefined) return null

  return (
    <>
      <StarInputForm update={updateInfo} name='Breast' value={star.info.breast} list={starData.breast} />
      <StarInputForm update={updateInfo} name='HairColor' value={star.info.haircolor} list={starData.haircolor} />
      <StarInputForm update={updateInfo} name='HairStyle' value={star.info.hairstyle} list={starData.hairstyle} />
      <StarInputForm
        update={addAttribute}
        name='Attribute'
        emptyByDefault
        value={star.info.attribute.toString()}
        list={starData.attribute}
      >
        <StarAttributes data={star.info.attribute} remove={removeAttribute} />
      </StarInputForm>
    </>
  )
}

interface StarImageDropboxProps {
  star: IStar
  videos: IStarVideo[]
  update: ISetState<IStar | undefined>
}
const StarImageDropbox = ({ star, videos, update }: StarImageDropboxProps) => {
  const router = useRouter()

  const addImage = (image: string) => {
    axios.post(`${serverConfig.api}/star/${star.id}/image`, { url: image }).then(() => {
      update({ ...star, image: `${star.id}.jpg` })
    })
  }

  const removeImage = () => {
    axios.delete(`${serverConfig.api}/star/${star.id}/image`).then(() => {
      update({ ...star, image: null })
    })
  }

  const removeStar = () => {
    axios.delete(`${serverConfig.api}/star/${star.id}`).then(() => {
      router.replace('/star')

      //TODO use stateObj instead
    })
  }

  return (
    <div className='d-inline-block'>
      {star.image !== null ? (
        <>
          <ContextMenuTrigger id='star__image'>
            <Image
              id={styles.profile}
              src={`${serverConfig.api}/star/${star.id}/image`}
              alt='star'
              width={200}
              height={275}
            />
          </ContextMenuTrigger>

          <ContextMenu id='star__image'>
            <MenuItem onClick={removeImage}>
              <Icon code='trash' /> Delete Image
            </MenuItem>
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id='star__dropbox'>
            <Dropbox onDrop={addImage} />
          </ContextMenuTrigger>

          <ContextMenu id='star__dropbox'>
            <MenuItem onClick={removeStar} disabled={videos.length > 0}>
              <Icon code='trash' /> Remove Star
            </MenuItem>
          </ContextMenu>
        </>
      )}
    </div>
  )
}

const StarVideo = ({ video }: { video: IStarVideo }) => {
  const [src, setSrc] = useState('')

  // FIXME this is not working as intended
  const [dataSrc, setDataSrc] = useState(`${serverConfig.api}/video/${video.id}/file`)

  const thumbnail = useRef<NodeJS.Timer>()

  // eslint-disable-next-line @typescript-eslint/require-await
  const reload = async () => {
    setSrc(dataSrc)
    setDataSrc('')
  }

  const unload = () => {
    setDataSrc(src)
    setSrc('')
  }

  const playFrom = (video: HTMLVideoElement, time = 0) => {
    if (time) video.currentTime = time

    video.play()
  }

  const stopFrom = (video: HTMLVideoElement, time = 0) => {
    if (time) video.currentTime = time

    video.pause()
  }

  const startThumbnailPlayback = (video: HTMLVideoElement) => {
    let time = 100
    const offset = 60
    const duration = 1.5

    playFrom(video)
    thumbnail.current = setInterval(() => {
      time += offset
      if (time > video.duration) {
        stopThumbnailPlayback(video).then(() => startThumbnailPlayback(video))
      }
      playFrom(video, (time += offset))
    }, duration * 1000)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const stopThumbnailPlayback = async (video: HTMLVideoElement) => {
    stopFrom(video)

    clearInterval(thumbnail.current)
  }

  const handleMouseEnter = ({ target }: React.MouseEvent<HTMLVideoElement> & { target: HTMLVideoElement }) => {
    if (dataSrc.length && !src.length) {
      reload().then(() => startThumbnailPlayback(target))
    }
  }

  const handleMouseLeave = ({ target }: React.MouseEvent<HTMLVideoElement> & { target: HTMLVideoElement }) => {
    if (!dataSrc.length && src.length) {
      stopThumbnailPlayback(target).then(() => unload())
    }
  }

  return (
    <Link className={styles.video} href={{ pathname: '/video/[id]', query: { id: video.id } }}>
      <Card>
        <CardActionArea>
          <CardMedia
            component='video'
            src={src}
            data-src={dataSrc}
            preload='metadata'
            poster={`${serverConfig.api}/video/${video.id}/thumb`}
            muted
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            height='200' // fixed height to prevent resizing
          />

          <CardContent>
            <Typography className='text-center'>{video.name}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  )
}

interface StarInputFormProps {
  update: (value: string, label: string) => void
  value: string
  name: string
  list: any
  emptyByDefault?: boolean
  children?: React.ReactNode
}
const StarInputForm = ({ value, emptyByDefault = false, update, name, list, children }: StarInputFormProps) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const updateValue = (value: string) => {
    if (value === '') setOpen(false)

    setInputValue(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<any>) => {
    if (!open && e.key === 'Enter') {
      update(inputValue, name.toLowerCase())

      if (emptyByDefault) setInputValue('')
    }
  }

  const isChanged = inputValue.toLowerCase() !== (!emptyByDefault ? value : '').toLowerCase()
  const shouldShrink = isChanged || (typeof value === 'string' && value.length > 0)

  useEffect(() => {
    if (!emptyByDefault && value.length) {
      setInputValue(value)
    }
  }, [emptyByDefault, value])

  // FIXME excluding an item from dropdown causes a warning
  return (
    <Grid container style={{ marginBottom: 4 }}>
      <Grid item xs={3}>
        <Autocomplete
          inputValue={inputValue}
          //
          // EVENTS
          onInputChange={(e, val, reason) => {
            if (reason === 'reset' && !open) return

            updateValue(val)
          }}
          onKeyPress={handleKeyPress}
          //
          // OPTIONS
          options={list.filter((item: any) => (emptyByDefault && value.includes(item) ? null : item))}
          renderInput={params => (
            <TextField
              {...params}
              variant='standard'
              label={name}
              color='primary'
              InputLabelProps={{
                shrink: shouldShrink,
                className: styles['no-error']
              }}
              className={isChanged ? styles.error : ''}
            />
          )}
          autoHighlight
          clearOnBlur={false}
          //
          // open/closed STATUS
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        />
      </Grid>

      <Grid item style={{ marginTop: 14, marginLeft: 8 }}>
        {children}
      </Grid>
    </Grid>
  )
}

interface StarAttributesProps {
  remove: (name: string) => void
  data: any
}
const StarAttributes = ({ remove, data }: StarAttributesProps) => {
  return data.map((attribute: any, idx: number) => (
    <Fragment key={attribute}>
      <ContextMenuTrigger id={`attribute-${idx}`} renderTag='span'>
        <span className={styles.attribute}>
          <Button size='small' variant='outlined' color='primary'>
            {attribute}
          </Button>
        </span>
      </ContextMenuTrigger>

      <ContextMenu id={`attribute-${idx}`}>
        <MenuItem onClick={() => remove(attribute)}>
          <Icon code='trash' /> Remove
        </MenuItem>
      </ContextMenu>
    </Fragment>
  ))
}

interface StarTitleProps {
  star: IStar
  onModal: IModalHandler
  update: ISetState<IStar | undefined>
}
const StarTitle = ({ star, onModal: handleModal, update }: StarTitleProps) => {
  const renameStar = (name: string) => {
    axios.put(`${serverConfig.api}/star/${star.id}`, { name }).then(() => {
      update({ ...star, name })
    })
  }

  const setLink = (link: string) => {
    axios
      .put(`${serverConfig.api}/star/${star.id}`, {
        label: 'starLink',
        value: link
      })
      .then(() => {
        update({ ...star, link })
      })
  }

  return (
    <div>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title'>
          <h2>
            {star.name}
            {star.link !== null && (
              <>
                {' '}
                (
                <Link href={star.link} target='_blank'>
                  LINK
                </Link>
                )
              </>
            )}
          </h2>
        </ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <MenuItem
          onClick={() => {
            handleModal(
              'Rename',
              <TextField
                defaultValue={star.name}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()

                    handleModal()

                    //@ts-expect-error: target is missing from MUI
                    renameStar(e.target.value)
                  }
                }}
              />
            )
          }}
        >
          <Icon code='edit' /> Rename
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleModal(
              'Set Link',
              <TextField
                defaultValue={star.link}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()

                    handleModal()
                    //@ts-expect-error: target is missing from MUI
                    setLink(e.target.value)
                  }
                }}
              />
            )
          }}
        >
          <Icon code='edit' /> Set Link
        </MenuItem>
      </ContextMenu>
    </div>
  )
}

export default StarPage
