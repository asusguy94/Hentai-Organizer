import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { Fragment, useState, useRef, useEffect } from 'react'
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

import { ContextMenuTrigger, ContextMenu, ContextMenuItem as MenuItem } from 'rctx-contextmenu'

import Image from '@components/image'
import Link from '@components/link'
import ModalComponent, { ModalHandler, useModal } from '@components/modal'
import Spinner from '@components/spinner'
import Dropbox from '@components/dropbox'
import { IconWithText } from '@components/icon'

import { SetState } from '@interfaces'
import { starService } from '@service'
import { serverConfig } from '@config'
import prisma from '@utils/server/prisma'

import styles from './star.module.scss'

type StarVideo = {
  id: number
  name: string
  path: string
}

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

export const getServerSideProps: GetServerSideProps<
  { star: Star; videos: StarVideo[] },
  { id: string }
> = async context => {
  const id = context.params?.id
  if (id === undefined) throw new Error("'id' is missing")

  const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })

  const videos = await prisma.video.findMany({
    select: { id: true, name: true, path: true },
    where: { stars: { some: { starID: parseInt(id) } } },
    orderBy: [{ franchise: 'asc' }, { episode: 'asc' }]
  })

  return {
    props: {
      star: {
        id: star.id,
        name: star.name,
        image: star.image,

        info: {
          breast: star.breast ?? '',
          haircolor: star.haircolor ?? '',
          hairstyle: star.hairstyle ?? '',
          attribute: (
            await prisma.starAttributes.findMany({
              where: { starID: star.id },
              include: { attribute: true }
            })
          ).map(({ attribute }) => attribute.name)
        },
        link: star.starLink
      },
      videos
    }
  }
}

const StarPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ videos, star: starData }) => {
  const [star, setStar] = useState<typeof starData>() //FIXME cannot be set directly
  const { modal, setModal } = useModal()

  useEffect(() => {
    setStar(starData)
  }, [starData])

  if (star === undefined) return <Spinner />

  return (
    <Grid container>
      <Grid item xs={6}>
        <div id={styles.star}>
          <StarImageDropbox star={star} videos={videos} update={setStar} />

          <StarTitle star={star} onModal={setModal} update={setStar} />

          <StarForm star={star} update={setStar} />

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
const StarVideos = ({ videos }: StarVideosProps) => {
  if (videos.length === 0) return null

  return (
    <Grid container>
      <Typography variant='h6'>Videos</Typography>

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
  update: SetState<Star | undefined>
}
const StarForm = ({ star, update }: StarFormProps) => {
  const { data: starData } = starService.useInfo()

  const addAttribute = (name: string) => {
    starService.addAttribute(star.id, name).then(() => {
      update({
        ...star,
        info: { ...star.info, attribute: [...star.info.attribute, name] }
      })
    })
  }

  const removeAttribute = (name: string) => {
    starService.removeAttribute(star.id, name).then(() => {
      update({
        ...star,
        info: {
          ...star.info,
          attribute: star.info.attribute.filter(attr => attr.toLowerCase() !== name.toLowerCase())
        }
      })
    })
  }

  const updateInfo = (value: string, label: string) => {
    starService.updateInfo(star.id, label, value).then(() => {
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

type StarImageDropboxProps = {
  star: Star
  videos: StarVideo[]
  update: SetState<Star | undefined>
}
const StarImageDropbox = ({ star, videos, update }: StarImageDropboxProps) => {
  const router = useRouter()

  const addImage = (image: string) => {
    starService.addImage(star.id, image).then(() => {
      update({ ...star, image: `${star.id}.jpg` })
    })
  }

  const removeImage = () => {
    starService.removeImage(star.id).then(() => {
      update({ ...star, image: null })
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
            <IconWithText component={MenuItem} icon='delete' text='Delete Image' onClick={removeImage} />
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id='star__dropbox'>
            <Dropbox onDrop={addImage} />
          </ContextMenuTrigger>

          <ContextMenu id='star__dropbox'>
            <IconWithText
              component={MenuItem}
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

const StarVideo = ({ video }: { video: StarVideo }) => {
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

type StarInputFormProps = {
  update: (value: string, label: string) => void
  value: string
  name: string
  list: string[]
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
          options={list.filter(item => (emptyByDefault && value.includes(item) ? null : item))}
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

type StarAttributesProps = {
  remove: (name: string) => void
  data: string[]
}
const StarAttributes = ({ remove, data }: StarAttributesProps) => (
  <>
    {data.map((attribute, idx) => (
      <Fragment key={attribute}>
        <ContextMenuTrigger id={`attribute-${idx}`} className='d-inline-block'>
          <span className={styles.attribute}>
            <Button size='small' variant='outlined' color='primary'>
              {attribute}
            </Button>
          </span>
        </ContextMenuTrigger>

        <ContextMenu id={`attribute-${idx}`}>
          <IconWithText component={MenuItem} icon='delete' text='Remove' onClick={() => remove(attribute)} />
        </ContextMenu>
      </Fragment>
    ))}
  </>
)

type StarTitleProps = {
  star: Star
  onModal: ModalHandler
  update: SetState<Star | undefined>
}
const StarTitle = ({ star, onModal: handleModal, update }: StarTitleProps) => {
  const renameStar = (name: string) => {
    starService.renameStar(star.id, name).then(() => {
      update({ ...star, name })
    })
  }

  const setLink = (link: string) => {
    starService.setLink(star.id, link).then(() => {
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
        <IconWithText
          component={MenuItem}
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
                    renameStar(e.target.value)
                  }
                }}
              />
            )
          }}
        />

        <IconWithText
          component={MenuItem}
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

export default StarPage
