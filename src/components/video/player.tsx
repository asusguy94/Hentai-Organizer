import { Button, TextField } from '@mui/material'

import { useNavigate } from '@tanstack/react-router'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Player, { MediaPlayerInstance } from '@/components/vidstack'

import { IconWithText } from '../icon'
import { Modal, ModalHandler } from '../modal'

import { serverConfig } from '@/config'
import { Bookmark, Category, Video, VideoStar } from '@/interface'
import { videoService } from '@/service'

type VideoPlayerProps = {
  video: Video
  bookmarks: Bookmark[]
  categories: Category[]
  stars: VideoStar[]
  playerRef: React.RefObject<MediaPlayerInstance>
  modal: {
    handler: ModalHandler
    data: Modal
  }
}
export default function VideoPlayer({ video, bookmarks, categories, stars, playerRef, modal }: VideoPlayerProps) {
  const navigate = useNavigate()
  const { mutate } = videoService.useAddBookmark(video.id)

  const copy = () => {
    navigator.clipboard.writeText(video.path.file.slice(0, -4))
  }

  const deleteVideo = () => {
    videoService.deleteVideo(video.id).then(() => {
      navigate({ to: '/video' })
    })
  }

  const renameVideo = (path: string) => {
    videoService.renameVideo(video.id, path).then(() => {
      location.reload()
    })
  }

  const censorToggle = () => {
    videoService.toggleCensor(video.id, video.censored).then(() => {
      location.reload()
    })
  }

  const updateVideo = () => {
    videoService.updateVideo(video.id).then(() => {
      location.reload()
    })
  }

  const setCover = () => {
    videoService.setCover(video.id).then(() => {
      location.reload()
    })
  }

  const setPoster = () => {
    videoService.setPoster(video.id).then(() => {
      location.reload()
    })
  }

  const addBookmark = (category: Category) => {
    const player = playerRef.current

    if (player !== null) {
      const time = Math.round(player.currentTime)
      if (time) {
        mutate({ categoryID: category.id, time })
      }
    }
  }

  return (
    <>
      <ContextMenuTrigger id='video'>
        <Player
          title={video.name}
          playerRef={playerRef}
          video={video}
          bookmarks={bookmarks}
          poster={`${serverConfig.newApi}/video/${video.id}/poster`}
          thumbnails={`${serverConfig.newApi}/video/${video.id}/vtt`}
          src={{
            video: `${serverConfig.newApi}/video/${video.id}/file`,
            hls: `${serverConfig.newApi}/video/${video.id}/hls`
          }}
          modal={modal.data}
        />
      </ContextMenuTrigger>

      <ContextMenu id='video'>
        <IconWithText
          component={ContextMenuItem}
          icon='add'
          text='Add Bookmark'
          disabled={video.noStar}
          onClick={() => {
            modal.handler(
              'Add Bookmark',
              categories.map(category => (
                <Button
                  variant='outlined'
                  color='primary'
                  key={category.id}
                  onClick={() => {
                    modal.handler()
                    addBookmark(category)
                  }}
                >
                  {category.name}
                </Button>
              )),
              true
            )
          }}
        />

        <IconWithText
          component={ContextMenuItem}
          icon={video.censored ? 'check-circle' : 'warn-cirlce'}
          text={video.censored ? 'UnCensor' : 'Censor'}
          onClick={censorToggle}
        />

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Rename Video'
          onClick={() => {
            modal.handler(
              'Rename Video',
              <TextField
                defaultValue={video.path.file}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    modal.handler()

                    renameVideo((e.target as HTMLInputElement).value)
                  }
                }}
              />
            )
          }}
        />

        <hr />

        <IconWithText component={ContextMenuItem} icon='copy' text='Copy Filename' onClick={copy} />

        <hr />

        <IconWithText component={ContextMenuItem} icon='edit' text='Set Cover' onClick={setCover} />
        <IconWithText component={ContextMenuItem} icon='edit' text='Set Poster' onClick={setPoster} />
        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Set Cover & Poster'
          onClick={() => {
            setCover()
            setPoster()
          }}
        />

        <IconWithText component={ContextMenuItem} icon='edit' text='Update Video' onClick={updateVideo} />

        <hr />

        <IconWithText
          component={ContextMenuItem}
          icon='delete'
          text='Delete Video'
          disabled={stars.length !== 0}
          onClick={deleteVideo}
        />
      </ContextMenu>
    </>
  )
}
