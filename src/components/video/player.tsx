import { Button, TextField } from '@mui/material'

import { useNavigate } from '@tanstack/react-router'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Player, { MediaPlayerInstance } from '@/components/vidstack'

import { IconWithText } from '../icon'
import Spinner from '../spinner'

import { serverConfig } from '@/config'
import { useModalContext } from '@/context/modalContext'
import { Category } from '@/interface'
import { categoryService, videoService } from '@/service'

type VideoPlayerProps = {
  videoId: number
  playerRef: React.RefObject<MediaPlayerInstance>
  onReady: () => void
}
export default function VideoPlayer({ videoId, playerRef, onReady }: VideoPlayerProps) {
  const navigate = useNavigate()

  const { data: video } = videoService.useVideo(videoId)
  const { data: categories } = categoryService.useAll()
  const { data: stars } = videoService.useStars(videoId)

  const { mutate: mutateAddBookmark } = videoService.useAddBookmark(videoId)
  const { mutate: mutateToggleCensor } = videoService.useToggleCensor(videoId)

  const { setModal } = useModalContext()

  if (video === undefined) return <Spinner />

  const copy = () => {
    navigator.clipboard.writeText(video.path.file.slice(0, -4))
  }

  const deleteVideo = () => {
    videoService.deleteVideo(videoId).then(() => {
      navigate({ to: '/video' })
    })
  }

  const renameVideo = (path: string) => {
    videoService.renameVideo(videoId, path).then(() => {
      location.reload()
    })
  }

  const setCover = () => {
    videoService.setCover(videoId).then(() => {
      location.reload()
    })
  }

  const setPoster = () => {
    videoService.setPoster(videoId).then(() => {
      location.reload()
    })
  }

  const addBookmark = (category: Category) => {
    const player = playerRef.current

    if (player !== null) {
      const time = Math.round(player.currentTime)
      if (time) {
        mutateAddBookmark({
          categoryID: category.id,
          time
        })
      }
    }
  }

  return (
    <>
      <ContextMenuTrigger id='video'>
        <Player
          videoId={videoId}
          title={video.name}
          playerRef={playerRef}
          poster={`${serverConfig.newApi}/video/${videoId}/poster`}
          thumbnails={`${serverConfig.newApi}/video/${videoId}/vtt`}
          src={{
            video: `${serverConfig.newApi}/video/${videoId}/file`,
            hls: `${serverConfig.newApi}/video/${videoId}/hls`
          }}
          onReady={onReady}
        />
      </ContextMenuTrigger>

      <ContextMenu id='video'>
        <IconWithText
          component={ContextMenuItem}
          icon='add'
          text='Add Bookmark'
          disabled={video.noStar}
          onClick={() => {
            setModal(
              'Add Bookmark',
              categories?.map(category => (
                <Button
                  variant='outlined'
                  color='primary'
                  key={category.id}
                  onClick={() => {
                    setModal()
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
          onClick={() => mutateToggleCensor({ cen: !video.censored })}
        />

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Rename Video'
          onClick={() => {
            setModal(
              'Rename Video',
              <TextField
                defaultValue={video.path.file}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    setModal()

                    // TODO use form
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

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Update Video'
          onClick={() => {
            videoService.updateVideo(videoId).then(() => {
              location.reload()
            })
          }}
        />

        <hr />

        <IconWithText
          component={ContextMenuItem}
          icon='delete'
          text='Delete Video'
          disabled={stars === undefined || stars.length !== 0}
          onClick={deleteVideo}
        />
      </ContextMenu>
    </>
  )
}
