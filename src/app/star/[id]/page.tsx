'use client'

import { useParams, useRouter } from 'next/navigation'
import { Fragment, useEffect, useRef, useState } from 'react'

import {
  Autocomplete,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Typography
} from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Dropbox from '@components/dropbox'
import { IconWithText } from '@components/icon'
import Image from '@components/image'
import Link from '@components/link'
import ModalComponent, { ModalHandler, useModal } from '@components/modal'
import Spinner from '@components/spinner'

import { serverConfig } from '@config'
import { StarVideo } from '@interfaces'
import { starService } from '@service'

import styles from './star.module.scss'
import validate, { z } from '@utils/server/validation'
import { mutateAndInvalidate } from '@utils/shared'
import { keys } from '@keys'
import { useQueryClient } from '@tanstack/react-query'

type Star = {
  id: number
  name: string
  image: string | null
  info: {
    breast: string
    haircolor: string
    hairstyle: string
    attribute: string[]
  }
  link: string | null
}

export default function StarPage() {
  const params = useParams<{id:string}>()

  const {id} = validate(z.object({ id: z.coerce.number() }), params)

  if(params?.id === undefined) throw new Error('id is undefined')

  const { data: star } = starService.useStar(id)
  const { data: videos } = starService.useVideos(id)
  const { modal, setModal } = useModal() 

  

  if (star === undefined || videos === undefined) return <Spinner />

  return (
    <Grid container>
      <Grid item xs={6}>
        <div id={styles.star}>
          <StarImageDropbox star={star} videos={videos}  />
          <StarTitle star={star} onModal={setModal}  />
          <StarForm star={star}  />
          <StarVideos videos={videos} />
        </div>

        <ModalComponent visible={modal.visible} title={modal.title} filter={modal.filter} onClose={setModal}>
          {modal.data}
        </ModalComponent>
      </Grid>
    </Grid>
  )
}

type StarVideosProps = {
  videos: StarVideo[]
}
function StarVideos({ videos }: StarVideosProps) {
  if (videos.length === 0) return null

  return (
    <Grid container style={{ marginTop: 12 }}>
      <Grid container id={styles.videos}>
        {videos.map(video => (
          <StarVideo key={video.id} video={video} />
        ))}
      </Grid>
    </Grid>
  )
}

type StarFormProps = {
  star: Star
}
function StarForm({ star }: StarFormProps) {
  const { data: starData } = starService.useInfo()
  const { mutate } = starService.useUpdateInfo(star.id)
  const { mutate: mutateAddAttribute } = starService.useAddAttribute(star.id)
  const { mutate: mutateRemoveAttribute } = starService.useRemoveAttribute(star.id)
  const queryClient = useQueryClient()

  const addAttribute = (name: string) => {
    mutateAndInvalidate({
      mutate: mutateAddAttribute,
      queryClient,
      ...keys.stars.byId(star.id),
      variables: { name }
    })
  }

  const removeAttribute = (name: string) => {
    mutateAndInvalidate({
      mutate: mutateRemoveAttribute,
      queryClient,
      ...keys.stars.byId(star.id),
      variables: { name }
    })
  }

  const updateInfo = (value: string, label: string) => {
    mutateAndInvalidate({
      mutate,
      queryClient,
      ...keys.stars.byId(star.id),
      variables: { label, value }
    })
  }

  if (starData === undefined) return null

  return (
    <>
      <StarInputForm update={updateInfo} name='Breast' value={star.info.breast} list={starData.breast} />
      <StarInputForm update={updateInfo} name='Haircolor' value={star.info.haircolor} list={starData.haircolor} />
      <StarInputForm update={updateInfo} name='Hairstyle' value={star.info.hairstyle} list={starData.hairstyle} />
      <StarInputForm
        update={addAttribute}
        name='Attribute'
        value={star.info.attribute}
        list={starData.attribute}
        emptyByDefault
      >
        <StarAttributes data={star.info.attribute} remove={removeAttribute} />
      </StarInputForm>
    </>
  )
}

type StarImageDropboxProps = {
  star: Star
  videos: StarVideo[]
}
function StarImageDropbox({ star, videos }: StarImageDropboxProps) {
  const router = useRouter()
  const { mutate } = starService.useAddImage(star.id)
  const queryClient = useQueryClient()


  const addImage = (image: string) => {
    mutateAndInvalidate({
      mutate,
      queryClient,
      ...keys.stars.byId(star.id),
      variables: {url:image}
    })
  }

  const removeImage = () => {
    starService.removeImage(star.id).then(() => {
      location.reload()
    })
  }

  const removeStar = () => {
    starService.removeStar(star.id).then(() => {
      router.replace('/star')
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
            <IconWithText component={ContextMenuItem} icon='delete' text='Delete Image' onClick={removeImage} />
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id='star__dropbox'>
            <Dropbox onDrop={addImage} />
          </ContextMenuTrigger>

          <ContextMenu id='star__dropbox'>
            <IconWithText
              component={ContextMenuItem}
              icon='delete'
              text='Remove Star'
              onClick={removeStar}
              disabled={videos.length > 0}
            />
          </ContextMenu>
        </>
      )}
    </div>
  )
}

function StarVideo({ video }: { video: StarVideo }) {
  const [src, setSrc] = useState('')

  // FIXME this is not working as intended
  const [dataSrc, setDataSrc] = useState(`${serverConfig.api}/video/${video.id}/file`)

  const thumbnail = useRef<NodeJS.Timeout>()

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
    <Link className={styles.video} href={`/video/${video.id}`}>
      <Card>
        <CardActionArea>
          <CardMedia
            component='video'
            src={src}
            data-src={dataSrc}
            preload='metadata'
            poster={`${serverConfig.api}/video/${video.id}/poster`}
            muted
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />

          <CardContent>
            <Typography className='text-center'>{video.name}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  )
}

type StarInputFormProps = {
  update: (value: string, label: string) => void
  value: string | string[]
  name: string
  list: string[]
  emptyByDefault?: boolean
  children?: React.ReactNode
}
function StarInputForm({ value, update, name, list, children, emptyByDefault = false }: StarInputFormProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  const updateValue = (value: string) => {
    if (value === '') setOpen(false)

    setInput(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!open) {
      update(input, name.toLowerCase())

      if (emptyByDefault) setInput('')
    }
  }

  const isChanged = input.toLowerCase() !== (typeof value === 'string' && !emptyByDefault ? value : '').toLowerCase()
  const shouldShrink = isChanged || (typeof value === 'string' && value.length > 0)

  useEffect(() => {
    if (!emptyByDefault && typeof value === 'string') {
      setInput(value)
    }

    return () => setInput('')
  }, [emptyByDefault, value])

  // FIXME excluding an item from dropdown causes a warning
  return (
    <Grid container style={{ marginBottom: 4 }}>
      <Grid item xs={3} component='form' onSubmit={handleSubmit}>
        <Autocomplete
          inputValue={input}
          //
          // EVENTS
          onInputChange={(e, val, reason) => {
            if (reason === 'reset' && !open) return

            updateValue(val)
          }}
          //
          // OPTIONS
          options={list.filter(item => !(emptyByDefault && value.includes(item)))}
          renderInput={params => (
            <TextField
              {...params}
              variant='standard'
              label={name}
              color='primary'
              InputLabelProps={{ shrink: shouldShrink, className: styles['no-error'] }}
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

type StarAttributesProps = {
  remove: (name: string) => void
  data: string[]
}
function StarAttributes({ remove, data }: StarAttributesProps) {
  return (
    <>
      {data.map(attribute => (
        <Fragment key={attribute}>
          <ContextMenuTrigger id={attribute} className='d-inline-block'>
            <span className={styles.attribute}>
              <Button size='small' variant='outlined' color='primary'>
                {attribute}
              </Button>
            </span>
          </ContextMenuTrigger>

          <ContextMenu id={attribute}>
            <IconWithText component={ContextMenuItem} icon='delete' text='Remove' onClick={() => remove(attribute)} />
          </ContextMenu>
        </Fragment>
      ))}
    </>
  )
}

type StarTitleProps = {
  star: Star
  onModal: ModalHandler
}
function StarTitle({ star, onModal: handleModal }: StarTitleProps) {
  const renameStar = (name: string) => {
    starService.renameStar(star.id, name).then(() => {
      location.reload()
    })
  }

  const setLink = (link: string) => {
    starService.setLink(star.id, link).then(() => {
      location.reload()
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
        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Rename'
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    renameStar(e.target.value)
                  }
                }}
              />
            )
          }}
        />

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Set Link'
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    setLink(e.target.value)
                  }
                }}
              />
            )
          }}
        />
      </ContextMenu>
    </div>
  )
}
