import { Button, Grid, TextField, Typography } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Icon, { IconWithText } from '../icon'
import { ModalHandler } from '../modal'

import { Video } from '@interfaces'
import { videoService } from '@service'
import { escapeRegExp } from '@utils/shared'

import styles from './header.module.scss'

type HeaderProps = {
  video: Video
  onModal: ModalHandler
}
export default function Header({ video, onModal }: HeaderProps) {
  const { data: isValid } = videoService.useIsValid(video.id)

  if (isValid === undefined) return null

  return (
    <Grid container item alignItems='center' component='header' id={styles.header}>
      <HeaderTitle video={video} onModal={onModal} isValid={isValid.title} />

      {video.slug === null ? (
        <HeaderSlug video={video} onModal={onModal} />
      ) : (
        <>
          <InvalidFname video={video} isValid={isValid.fname} />
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
  onModal: ModalHandler
  isValid: boolean
}
function HeaderTitle({ video, onModal, isValid }: HeaderTitleProps) {
  const copyFranchise = async () => await navigator.clipboard.writeText(video.franchise)

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
            onModal(
              'Change Title',
              <TextField
                defaultValue={video.name}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onModal()

                    //@ts-expect-error: target is missing from MUI
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    renameTitle(e.target.value)
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
            onModal(
              video.name.startsWith(video.franchise) ? 'Change Franchise & Title' : 'Change Franchise',
              <TextField
                defaultValue={video.franchise}
                autoFocus
                fullWidth
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onModal()

                    //@ts-expect-error: target is missing from MUI
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    renameFranchise(e.target.value)
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
            onModal(
              'Set Slug',
              <TextField
                defaultValue={video.slug}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    //@ts-expect-error: target is missing from MUI
                    const value: string = e.target.value

                    // Only submit data if all lowercase
                    if (value === value.toLowerCase()) {
                      onModal()
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
  onModal: ModalHandler
}
function HeaderSlug({ video, onModal }: HeaderSlugProps) {
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
        onModal(
          'Set Slug',
          <TextField
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                //@ts-expect-error: target is missing from MUI
                const value: string = e.target.value

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
  const handleNetwork = () => {
    videoService.setBrand(video.id).then(() => {
      location.reload()
    })
  }

  return (
    <Button size='small' variant='outlined' onClick={handleNetwork}>
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
