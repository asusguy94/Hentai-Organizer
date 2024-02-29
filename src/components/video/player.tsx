import { useRouter } from 'next/navigation'

import { Button, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Player, { MediaPlayerInstance } from '@components/vidstack'

import { IconWithText } from '../icon'
import { Modal, ModalHandler } from '../modal'

import { serverConfig } from '@config'
import { Bookmark, Category, Video, VideoStar, SetState } from '@interfaces'
import { videoService } from '@service'

type VideoPlayerProps = {
  video: Video
  bookmarks: Bookmark[]
  categories: Category[]
  stars: VideoStar[]
  update: {
    video: SetState<Video | undefined>
    bookmarks: SetState<Bookmark[]>
  }
  playerRef: React.RefObject<MediaPlayerInstance>
  modal: {
    handler: ModalHandler
    data: Modal
  }
}
export default function VideoPlayer({
  video,
  bookmarks,
  categories,
  stars,
  update,
  playerRef,
  modal
}: VideoPlayerProps) {
  const router = useRouter()

  const copy = async () => await navigator.clipboard.writeText(video.path.file.slice(0, -4))

  const deleteVideo = () => {
    videoService.deleteVideo(video.id).then(() => {
      router.replace('/video')
    })
  }

  const renameVideo = (path: string) => {
    videoService.renameVideo(video.id, path).then(() => {
      router.refresh()
    })
  }

  const censorToggle = () => {
    videoService.toggleCensor(video.id, video.censored).then(() => {
      update.video({ ...video, censored: !video.censored })
    })
  }

  const updateVideo = () => {
    videoService.updateVideo(video.id).then(() => {
      router.refresh()
    })
  }

  const setCover = () => {
    videoService.setCover(video.id).then(() => {
      router.refresh()
    })
  }

  const setPoster = () => {
    videoService.setPoster(video.id).then(() => {
      router.refresh()
    })
  }

  const addBookmark = (category: Category) => {
    const player = playerRef.current

    if (player !== null) {
      const time = Math.round(player.currentTime)
      if (time) {
        videoService.addBookmark(video.id, category.id, time).then(({ data }) => {
          update.bookmarks(
            [
              ...bookmarks,
              {
                id: data.id,
                name: category.name,
                start: time,
                starID: 0,
                attributes: data.attributes ?? [],
                active: false,
                outfit: null
              }
            ].sort((a, b) => a.start - b.start)
          )
        })
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
          poster={`${serverConfig.api}/video/${video.id}/poster`}
          thumbnails={`${serverConfig.api}/video/${video.id}/vtt`}
          src={{
            video: `${serverConfig.api}/video/${video.id}/file`,
            hls: `${serverConfig.api}/video/${video.id}/hls`
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

                    //@ts-expect-error: target is undefined in MUI
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    renameVideo(e.target.value)
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
