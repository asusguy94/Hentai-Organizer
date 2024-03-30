import { Button, Grid, TextField, Typography } from '@mui/material'

import { useNavigate } from '@tanstack/react-router'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Icon, { IconWithText } from '../icon'
import Spinner from '../spinner'

import { useModalContext } from '@/context/modalContext'
import { videoService } from '@/service'
import { escapeRegExp } from '@/utils'

import styles from './header.module.scss'

type HeaderProps = {
  videoId: number
}
export default function Header({ videoId }: HeaderProps) {
  const { data: video } = videoService.useVideo(videoId)

  if (video === undefined) return <Spinner />

  return (
    <Grid container item alignItems='center' component='header' id={styles.header}>
      <HeaderTitle videoId={videoId} isValid={video.isValid.title} />

      {video.slug === null ? (
        <HeaderSlug videoId={videoId} />
      ) : (
        <>
          <InvalidFname videoId={videoId} isValid={video.isValid.fname} />
          <HeaderDate videoId={videoId} />
          <HeaderNetwork videoId={videoId} />
        </>
      )}

      <HeaderQuality videoId={videoId} />
    </Grid>
  )
}

type HeaderTitleProps = {
  videoId: number
  isValid: boolean
}
function HeaderTitle({ videoId, isValid }: HeaderTitleProps) {
  const { data: video } = videoService.useVideo(videoId)

  const { setModal } = useModalContext()

  if (video === undefined) return <Spinner />

  const copyFranchise = () => {
    navigator.clipboard.writeText(video.franchise)
  }

  const renameFranchise = (newFranchise: string) => {
    if (video.name.startsWith(video.franchise)) {
      const newTitle = video.name.replace(new RegExp(`^${escapeRegExp(video.franchise)}`), newFranchise)

      Promise.allSettled([
        videoService.renameFranchise(videoId, newFranchise),
        videoService.renameTitle(videoId, newTitle)
      ]).then(() => {
        location.reload()
      })
    } else {
      videoService.renameFranchise(videoId, newFranchise).then(() => {
        location.reload()
      })
    }
  }

  const renameTitle = (newTitle: string) => {
    videoService.renameTitle(videoId, newTitle).then(() => {
      location.reload()
    })
  }

  const setSlug = (slug: string) => {
    videoService.setSlug(videoId, slug).then(() => {
      location.reload()
    })
  }

  return (
    <Typography variant='h4'>
      <div
        className='d-inline-block'
        style={!isValid ? { textDecoration: 'line-through', textDecorationColor: 'red' } : {}}
      >
        <ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Rename Title'
          onClick={() => {
            setModal(
              'Change Title',
              <TextField
                defaultValue={video.name}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setModal()

                    // TODO use form
                    renameTitle((e.target as HTMLInputElement).value)
                  }
                }}
              />
            )
          }}
        />

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Rename Franchise'
          onClick={() => {
            setModal(
              video.name.startsWith(video.franchise) ? 'Change Franchise & Title' : 'Change Franchise',
              <TextField
                defaultValue={video.franchise}
                autoFocus
                fullWidth
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setModal()

                    // TODO use form
                    renameFranchise((e.target as HTMLInputElement).value)
                  }
                }}
              />
            )
          }}
        />

        <hr />

        <IconWithText component={ContextMenuItem} icon='copy' text='Copy Franchise' onClick={copyFranchise} />

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Set Slug'
          onClick={() => {
            setModal(
              'Set Slug',
              <TextField
                defaultValue={video.slug}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    // TODO use form
                    const value: string = (e.target as HTMLInputElement).value

                    // Only submit data if all lowercase
                    if (value === value.toLowerCase()) {
                      setModal()
                      setSlug(value)
                    }
                  }
                }}
              />
            )
          }}
        />
      </ContextMenu>

      <span id={styles.censored}>
        {video.censored && (
          <>
            <span id={styles.divider}>-</span>
            <span id={styles.label}>Censored</span>
          </>
        )}
      </span>
    </Typography>
  )
}

type HeaderSlugProps = {
  videoId: number
}
function HeaderSlug({ videoId }: HeaderSlugProps) {
  const { setModal } = useModalContext()

  const setSlug = (value: string) => {
    videoService.setSlug(videoId, value).then(() => {
      location.reload()
    })
  }

  return (
    <Button
      size='small'
      variant='outlined'
      onClick={() => {
        setModal(
          'Set Slug',
          <TextField
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const value: string = (e.target as HTMLInputElement).value

                // TODO use form

                // Only submit data if all lowercase
                if (value === value.toLowerCase()) {
                  setSlug(value)
                }
              }
            }}
          />
        )
      }}
    >
      <Icon code='edit' />
      <span>Set Slug</span>
    </Button>
  )
}

type HeaderDateProps = {
  videoId: number
}
function HeaderDate({ videoId }: HeaderDateProps) {
  const { data: video } = videoService.useVideo(videoId)

  if (video === undefined) return <Spinner />

  const handleDate = () => {
    videoService.setDate(videoId).then(() => {
      location.reload()
    })
  }

  return (
    <Button size='small' variant='outlined' onClick={handleDate}>
      <Icon code='calendar' />
      <span>{video.date.published ?? 'Get Date'}</span>
    </Button>
  )
}

type InvalidFnameProps = {
  videoId: number
  isValid: boolean
}
function InvalidFname({ videoId, isValid }: InvalidFnameProps) {
  const { data: video } = videoService.useVideo(videoId)

  if (video === undefined) return <Spinner />

  const handleRename = () => {
    if (video.slug !== null) {
      videoService.renameVideo(videoId, `${video.slug}.mp4`).then(() => {
        location.reload()
      })
    }
  }

  if (isValid) return null

  return (
    <Button size='small' variant='outlined' onClick={handleRename} disabled={video.slug === null}>
      <Icon code='brand' />
      <span>Rename File</span>
    </Button>
  )
}

type HeaderNetworkProps = {
  videoId: number
}
function HeaderNetwork({ videoId }: HeaderNetworkProps) {
  const { data: video } = videoService.useVideo(videoId)

  const navigate = useNavigate()

  if (video === undefined) return <Spinner />

  const handleClick = () => {
    if (video.brand === null) {
      videoService.setBrand(videoId).then(() => {
        location.reload()
      })
    } else {
      navigate({
        to: '/video/search',
        search: { network: video.brand }
      })
    }
  }

  return (
    <Button size='small' variant='outlined' onClick={handleClick}>
      <Icon code='brand' />
      <span>{video.brand ?? 'Get Brand'}</span>
    </Button>
  )
}

type HeaderQualityProps = {
  videoId: number
}
function HeaderQuality({ videoId }: HeaderQualityProps) {
  const { data: video } = videoService.useVideo(videoId)

  if (video === undefined) return <Spinner />
  if (video.quality >= 1080) return null

  return (
    <Button size='small' variant='outlined' id={styles.quality}>
      <Icon code='film' />
      {video.quality}
    </Button>
  )
}
