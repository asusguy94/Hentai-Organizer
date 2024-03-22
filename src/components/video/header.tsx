import { Button, Grid, TextField, Typography } from '@mui/material'

import { useNavigate } from '@tanstack/react-router'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Icon, { IconWithText } from '../icon'

import { useModalContext } from '@/context/modalContext'
import { Video } from '@/interface'
import { videoService } from '@/service'
import { escapeRegExp } from '@/utils'

import styles from './header.module.scss'

type HeaderProps = {
  video: Video
}
export default function Header({ video }: HeaderProps) {
  return (
    <Grid container item alignItems='center' component='header' id={styles.header}>
      <HeaderTitle video={video} isValid={video.isValid.title} />

      {video.slug === null ? (
        <HeaderSlug video={video} />
      ) : (
        <>
          <InvalidFname video={video} isValid={video.isValid.fname} />
          <HeaderDate video={video} />
          <HeaderNetwork video={video} />
        </>
      )}

      <HeaderQuality video={video} />
    </Grid>
  )
}

type HeaderTitleProps = {
  video: Video
  isValid: boolean
}
function HeaderTitle({ video, isValid }: HeaderTitleProps) {
  const { setModal } = useModalContext()

  const copyFranchise = () => {
    navigator.clipboard.writeText(video.franchise)
  }

  const renameFranchise = (newFranchise: string) => {
    if (video.name.startsWith(video.franchise)) {
      const newTitle = video.name.replace(new RegExp(`^${escapeRegExp(video.franchise)}`), newFranchise)

      Promise.allSettled([
        videoService.renameFranchise(video.id, newFranchise),
        videoService.renameTitle(video.id, newTitle)
      ]).then(() => {
        location.reload()
      })
    } else {
      videoService.renameFranchise(video.id, newFranchise).then(() => {
        location.reload()
      })
    }
  }

  const renameTitle = (newTitle: string) => {
    videoService.renameTitle(video.id, newTitle).then(() => {
      location.reload()
    })
  }

  const setSlug = (slug: string) => {
    videoService.setSlug(video.id, slug).then(() => {
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
  video: Video
}
function HeaderSlug({ video }: HeaderSlugProps) {
  const { setModal } = useModalContext()

  const setSlug = (value: string) => {
    videoService.setSlug(video.id, value).then(() => {
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
  video: Video
}
function HeaderDate({ video }: HeaderDateProps) {
  const handleDate = () => {
    videoService.setDate(video.id).then(() => {
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
  video: Video
  isValid: boolean
}
function InvalidFname({ video, isValid }: InvalidFnameProps) {
  if (isValid) return null

  const handleRename = () => {
    if (video.slug !== null) {
      videoService.renameVideo(video.id, `${video.slug}.mp4`).then(() => {
        location.reload()
      })
    }
  }

  return (
    <Button size='small' variant='outlined' onClick={handleRename} disabled={video.slug === null}>
      <Icon code='brand' />
      <span>Rename File</span>
    </Button>
  )
}

type HeaderNetworkProps = {
  video: Video
}
function HeaderNetwork({ video }: HeaderNetworkProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (video.brand === null) {
      videoService.setBrand(video.id).then(() => {
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
  video: Video
}
function HeaderQuality({ video }: HeaderQualityProps) {
  if (video.quality >= 1080) return null

  return (
    <Button size='small' variant='outlined' id={styles.quality}>
      <Icon code='film' />
      {video.quality}
    </Button>
  )
}
