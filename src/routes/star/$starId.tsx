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

import { Link, createFileRoute } from '@tanstack/react-router'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Dropbox from '@/components/dropbox'
import { IconWithText } from '@/components/icon'
import Spinner from '@/components/spinner'

import { serverConfig } from '@/config'
import { useModalContext } from '@/context/modalContext'
import { StarVideo } from '@/interface'
import { starService } from '@/service'

import styles from './star.module.scss'

export const Route = createFileRoute('/star/$starId')({
  parseParams: ({ starId }) => ({ starId: parseInt(starId) }),
  component: StarPage
})

export default function StarPage() {
  return (
    <Grid container>
      <Grid item xs={6}>
        <div id={styles.star}>
          <StarImageDropbox />
          <StarTitle />
          <StarForm />
          <Videos />
        </div>
      </Grid>
    </Grid>
  )
}

function Videos() {
  const { starId } = Route.useParams()

  const { data: videos } = starService.useVideos(starId)

  if (videos === undefined) return <Spinner />
  if (videos.length === 0) return null

  return (
    <Grid container style={{ marginTop: 12 }}>
      <Grid container id={styles.videos}>
        {videos.map(video => (
          <Video key={video.id} video={video} />
        ))}
      </Grid>
    </Grid>
  )
}

function StarForm() {
  const { starId } = Route.useParams()

  const { data: starData } = starService.useInfo()
  const { data: star } = starService.useStar(starId)

  const { mutate: mutateUpdateInfo } = starService.useUpdateInfo(starId)
  const { mutate: mutateAddAttribute } = starService.useAddAttribute(starId)
  const { mutate: mutateRemoveAttribute } = starService.useRemoveAttribute(starId)

  const updateInfo = (value: string, label: string) => {
    mutateUpdateInfo({ label, value })
  }

  if (starData === undefined || star === undefined) return <Spinner />

  return (
    <>
      <StarInputForm update={updateInfo} name='Breast' value={star.info.breast} list={starData.breast} />
      <StarInputForm update={updateInfo} name='Haircolor' value={star.info.haircolor} list={starData.haircolor} />
      <StarInputForm update={updateInfo} name='Hairstyle' value={star.info.hairstyle} list={starData.hairstyle} />
      <StarInputForm
        update={name => mutateAddAttribute({ name })}
        name='Attribute'
        value={star.info.attribute}
        list={starData.attribute}
        emptyByDefault
      >
        <StarAttributes data={star.info.attribute} remove={name => mutateRemoveAttribute({ name })} />
      </StarInputForm>
    </>
  )
}

function StarImageDropbox() {
  const { starId } = Route.useParams()

  const { data: star } = starService.useStar(starId)
  const { data: videos } = starService.useVideos(starId)

  const { mutate: mutateAddImage } = starService.useAddImage(starId)
  const { mutate: mutateRemoveImage } = starService.useRemoveImage(starId)
  const { mutate: mutateRemoveStar } = starService.useRemoveStar(starId)

  if (star === undefined) return <Spinner />

  return (
    <div className='d-inline-block'>
      {star.image !== null ? (
        <>
          <ContextMenuTrigger id='star__image'>
            <img
              id={styles.profile}
              //missing={false}
              src={`${serverConfig.newApi}/star/${starId}/image`}
              alt='star'
              style={{ width: '100%', height: 'auto' }}
            />
          </ContextMenuTrigger>

          <ContextMenu id='star__image'>
            <IconWithText component={ContextMenuItem} icon='delete' text='Delete Image' onClick={mutateRemoveImage} />
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id='star__dropbox'>
            <Dropbox onDrop={url => mutateAddImage({ url })} />
          </ContextMenuTrigger>

          <ContextMenu id='star__dropbox'>
            <IconWithText
              component={ContextMenuItem}
              icon='delete'
              text='Remove Star'
              onClick={mutateRemoveStar}
              disabled={videos?.length !== 0}
            />
          </ContextMenu>
        </>
      )}
    </div>
  )
}

function Video({ video }: { video: StarVideo }) {
  const [src, setSrc] = useState('')

  // FIXME this is not working as intended
  const [dataSrc, setDataSrc] = useState(`${serverConfig.newApi}/video/${video.id}/file`)

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
    <Link className={styles.video} to='/video/$videoId' params={{ videoId: video.id }}>
      <Card>
        <CardActionArea>
          <CardMedia
            component='video'
            src={src}
            data-src={dataSrc}
            preload='metadata'
            poster={`${serverConfig.newApi}/video/${video.id}/poster`}
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

  useEffect(() => {
    if (!emptyByDefault && typeof value === 'string') {
      setInput(value)
    }

    return () => setInput('')
  }, [emptyByDefault, value])

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

  // FIXME excluding an item from dropdown causes a warning
  return (
    <Grid container style={{ marginBottom: 4 }}>
      <Grid item xs={3} component='form' onSubmit={handleSubmit}>
        <Autocomplete
          inputValue={input}
          //
          // EVENTS
          onInputChange={(_e, val, reason) => {
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

function StarTitle() {
  const { starId } = Route.useParams()

  const { data: star } = starService.useStar(starId)

  const { mutate: mutateRenameStar } = starService.useRenameStar(starId)
  const { mutate: mutateSetLink } = starService.useSetLink(starId)

  const { setModal } = useModalContext()

  if (star === undefined) return <Spinner />

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
                <a href={star.link} target='_blank' rel='noreferrer'>
                  LINK
                </a>
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
            setModal(
              'Rename',
              <TextField
                defaultValue={star.name}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()

                    setModal()

                    // TODO use form
                    mutateRenameStar({ name: (e.target as HTMLInputElement).value })
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
            setModal(
              'Set Link',
              <TextField
                defaultValue={star.link}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()

                    setModal()

                    // TODO use form
                    mutateSetLink({ value: (e.target as HTMLInputElement).value })
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
