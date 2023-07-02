import { useRouter } from 'next/navigation'

import { Button, Grid, TextField, Typography } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem as MenuItem } from 'rctx-contextmenu'

import Icon, { IconWithText } from '../icon'
import { ModalHandler } from '../modal'

import { Video, SetState } from '@interfaces'
import { videoService } from '@service'

import styles from './header.module.scss'

type HeaderProps = {
  video: Video
  onModal: ModalHandler
  update: SetState<Video | undefined>
}
const Header = ({ video, update, onModal }: HeaderProps) => (
  <Grid container item alignItems='center' component='header' id={styles.header}>
    <HeaderTitle video={video} onModal={onModal} />

    <HeaderDate video={video} update={update} onModal={onModal} />
    <HeaderNetwork video={video} update={update} onModal={onModal} />

    <HeaderQuality video={video} />
  </Grid>
)

type HeaderTitleProps = {
  video: Video
  onModal: ModalHandler
}
const HeaderTitle = ({ video, onModal }: HeaderTitleProps) => {
  const router = useRouter()

  const copyFranchise = async () => await navigator.clipboard.writeText(video.franchise)

  const renameFranchise = (value: string) => {
    videoService.renameFranchise(video.id, value).then(() => {
      router.refresh()
    })
  }

  const renameTitle = (value: string) => {
    videoService.renameTitle(video.id, value).then(() => {
      router.refresh()
    })
  }

  return (
    <Typography variant='h4'>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <IconWithText
          component={MenuItem}
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
                    renameTitle(e.target.value)
                  }
                }}
              />
            )
          }}
        />

        <IconWithText
          component={MenuItem}
          icon='edit'
          text='Rename Franchise'
          onClick={() => {
            onModal(
              'Change Franchise',
              <TextField
                defaultValue={video.franchise}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onModal()

                    //@ts-expect-error: target is missing from MUI
                    renameFranchise(e.target.value)
                  }
                }}
              />
            )
          }}
        />

        <hr />

        <IconWithText component={MenuItem} icon='copy' text='Copy Franchise' onClick={() => void copyFranchise()} />
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

type HeaderDateProps = {
  video: Video
  update: SetState<Video | undefined>
  onModal: ModalHandler
}
const HeaderDate = ({ video, update, onModal }: HeaderDateProps) => {
  const handleDate = (value: string) => {
    videoService.setDate(video.id, value).then(({ data }) => {
      update({
        ...video,
        date: { ...video.date, published: data.date_published }
      })
    })
  }

  return (
    <>
      <ContextMenuTrigger id='menu__date' className='d-inline-block'>
        <Button size='small' variant='outlined'>
          <Icon code='calendar' />
          <span className={video.date.published === null ? styles['no-label'] : ''}>{video.date.published}</span>
        </Button>
      </ContextMenuTrigger>

      <ContextMenu id='menu__date'>
        <IconWithText
          component={MenuItem}
          icon='edit'
          text='Edit Date'
          onClick={() => {
            onModal(
              'Change Date',
              <TextField
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onModal()

                    //@ts-expect-error: target is missing from MUI
                    handleDate(e.target.value)
                  }
                }}
              />
            )
          }}
        />
      </ContextMenu>
    </>
  )
}

type HeaderNetworkProps = {
  video: Video
  update: SetState<Video | undefined>
  onModal: ModalHandler
}
const HeaderNetwork = ({ video, update, onModal }: HeaderNetworkProps) => {
  const handleNetwork = (value: string) => {
    videoService.setBrand(video.id, value).then(() => {
      update({ ...video, brand: value })
    })
  }

  return (
    <>
      <ContextMenuTrigger id='menu_network' className='d-inline-block'>
        <Button size='small' variant='outlined'>
          <Icon code='brand' />
          <span className={video.brand === null ? styles['no-label'] : ''}>{video.brand}</span>
        </Button>
      </ContextMenuTrigger>

      <ContextMenu id='menu_network'>
        <IconWithText
          component={MenuItem}
          icon='edit'
          text='Edit Network'
          onClick={() => {
            onModal(
              'Change Network',
              <TextField
                autoFocus
                defaultValue={video.brand}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onModal()

                    //@ts-expect-error: target is not a child by mui, but exists
                    handleNetwork(e.target.value)
                  }
                }}
              />
            )
          }}
        />
      </ContextMenu>
    </>
  )
}

type HeaderQualityProps = {
  video: Video
}
const HeaderQuality = ({ video }: HeaderQualityProps) => {
  if (video.quality >= 1080) return null

  return (
    <Button size='small' variant='outlined' id={styles.quality}>
      <Icon code='film' />
      {video.quality}
    </Button>
  )
}

export default Header
