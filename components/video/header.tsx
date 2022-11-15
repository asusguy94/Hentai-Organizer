import { Button, Grid, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/router'

import axios from 'axios'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'

import { IModalHandler } from '../modal'
import Icon from '../icon'

import { IVideo, ISetState } from '@interfaces'
import { serverConfig } from '@config'

import styles from './header.module.scss'

interface HeaderProps {
  video: IVideo
  onModal: IModalHandler
  update: ISetState<IVideo | undefined>
}
const Header = ({ video, update, onModal }: HeaderProps) => {
  return (
    <Grid container component='header' id={styles.header}>
      <Grid item>
        <HeaderTitle video={video} onModal={onModal} />

        <HeaderDate video={video} update={update} onModal={onModal} />
        <HeaderNetwork video={video} update={update} onModal={onModal} />

        <HeaderQuality video={video} />
      </Grid>
    </Grid>
  )
}

interface HeaderTitleProps {
  video: IVideo
  onModal: IModalHandler
}
const HeaderTitle = ({ video, onModal }: HeaderTitleProps) => {
  const router = useRouter()

  const copyFranchise = async () => await navigator.clipboard.writeText(video.franchise)

  const renameFranchise = (value: string) => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { franchise: value }).then(() => {
      router.reload()

      //TODO use stateObj instead
    })
  }

  const renameTitle = (value: string) => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { title: value }).then(() => {
      router.reload()

      //TODO use stateObj instead
    })
  }

  return (
    <Typography variant='h4' id={styles.title}>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title' holdToDisplay={-1}>
          {video.name}
        </ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <MenuItem
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
        >
          <Icon code='edit' /> Rename Title
        </MenuItem>

        <MenuItem
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
        >
          <Icon code='edit' /> Rename Franchise
        </MenuItem>

        <MenuItem divider />

        <MenuItem onClick={() => void copyFranchise()}>
          <Icon code='copy' /> Copy Franchise
        </MenuItem>
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

interface HeaderDateProps {
  video: IVideo
  update: ISetState<IVideo | undefined>
  onModal: IModalHandler
}
const HeaderDate = ({ video, update, onModal }: HeaderDateProps) => {
  const handleDate = (value: string) => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { date: value }).then(({ data }) => {
      update({
        ...video,
        date: { ...video.date, published: data.date_published }
      })
    })
  }

  return (
    <>
      <ContextMenuTrigger id='menu__date' renderTag='span' holdToDisplay={-1}>
        <Button size='small' variant='outlined' id={styles.date}>
          <Icon code='calendar' />
          <span className={video.date.published === null ? styles['no-label'] : ''}>{video.date.published}</span>
        </Button>
      </ContextMenuTrigger>

      <ContextMenu id='menu__date'>
        <MenuItem
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
        >
          <Icon code='edit' /> Edit Date
        </MenuItem>
      </ContextMenu>
    </>
  )
}

interface HeaderNetworkProps {
  video: IVideo
  update: ISetState<IVideo | undefined>
  onModal: IModalHandler
}
const HeaderNetwork = ({ video, update, onModal }: HeaderNetworkProps) => {
  const handleNetwork = (value: string) => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { brand: value }).then(() => {
      update({ ...video, brand: value })
    })
  }

  return (
    <>
      <ContextMenuTrigger id='menu_network' renderTag='span' holdToDisplay={-1}>
        <Button size='small' variant='outlined' id={styles.network}>
          <Icon code='brand' />
          <span className={video.brand === null ? styles['no-label'] : ''}>{video.brand}</span>
        </Button>
      </ContextMenuTrigger>

      <ContextMenu id='menu_network'>
        <MenuItem
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
        >
          <Icon code='edit' /> Edit Network
        </MenuItem>
      </ContextMenu>
    </>
  )
}

interface HeaderQualityProps {
  video: IVideo
}
const HeaderQuality = ({ video }: HeaderQualityProps) => (
  <Button size='small' variant='outlined' id={styles.quality}>
    <Icon code='film' />
    {video.quality}
  </Button>
)

export default Header
