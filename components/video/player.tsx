import { RefObject, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import HlsJS, { ErrorDetails } from 'hls.js'
import { useKey } from 'react-use'
import { useSessionStorage } from 'usehooks-ts'

import type { Modal, ModalHandler } from '../modal'
import Icon from '../icon'
import Plyr from '../plyr'

import { Bookmark, Category, Video, VideoStar, SetState } from '@interfaces'
import { videoService } from '@service'
import { serverConfig } from '@config'

type VideoPlayerProps = {
  video: Video
  bookmarks: Bookmark[]
  categories: Category[]
  stars: VideoStar[]
  update: {
    video: SetState<Video | undefined>
    bookmarks: SetState<Bookmark[]>
  }
  updateDuration: (duration: number) => void
  plyrRef: RefObject<HTMLVideoElement | Plyr | undefined>
  modal: {
    handler: ModalHandler
    data: Modal
  }
}
const VideoPlayer = ({
  video,
  bookmarks,
  categories,
  stars,
  update,
  updateDuration,
  plyrRef,
  modal
}: VideoPlayerProps) => {
  const router = useRouter()

  const playAddedRef = useRef(false)
  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  const [newVideo, setNewVideo] = useState<boolean>()
  const [events, setEvents] = useState(false)
  const [fallback, setFallback] = useState(false)

  const isArrow = (e: KeyboardEvent) => /^Arrow(Left|Right|Up|Down)$/.test(e.code)
  const isMute = (e: KeyboardEvent) => e.code === 'KeyM'
  const isSpace = (e: KeyboardEvent) => e.code === 'Space'

  const getPlayer = () => plyrRef.current as unknown as Plyr

  useKey(
    e => !modal.data.visible && (isArrow(e) || isMute(e) || isSpace(e)),
    e => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      e.preventDefault()

      const player = getPlayer()
      const getSeekTime = (multiplier = 1) => 1 * multiplier

      if (isMute(e)) {
        player.muted = !player.muted
      } else if (isSpace(e)) {
        if (player.playing) player.pause()
        else player.play()
      } else {
        switch (e.code) {
          case 'ArrowLeft':
            player.currentTime -= getSeekTime()
            break
          case 'ArrowRight':
            player.currentTime += getSeekTime()
            break
          case 'ArrowUp':
            player.volume = Math.ceil((player.volume + 0.1) * 10) / 10
            break
          case 'ArrowDown':
            player.volume = Math.floor((player.volume - 0.1) * 10) / 10
            break
        }
      }
    }
  )

  useEffect(() => {
    if (plyrRef.current !== undefined) {
      if (localVideo === video.id) {
        setNewVideo(false)
      } else {
        setNewVideo(true)
        setLocalVideo(video.id)
        setLocalBookmark(0)
      }
      setEvents(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plyrRef.current, video.id])

  useEffect(() => {
    if (events) {
      const player = getPlayer()

      player.on('timeupdate', () => {
        if (player.currentTime > 0) {
          setLocalBookmark(Math.round(player.currentTime))
        }
      })
      player.on('play', () => {
        if (newVideo && !playAddedRef.current) {
          playAddedRef.current = true

          videoService
            .addPlays(video.id)
            .then(() => {
              console.log('Play Added')
              playAddedRef.current = true
            })
            .catch(() => {
              playAddedRef.current = true
            })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (events) {
      const player = getPlayer() as Plyr & { media: HTMLVideoElement }

      if (HlsJS.isSupported()) {
        const hls = new HlsJS({
          maxBufferLength: Infinity,
          autoStartLoad: false
        })

        hls.loadSource(`${serverConfig.api}/video/${video.id}/hls`)
        hls.attachMedia(player.media)

        hls.on(HlsJS.Events.MANIFEST_PARSED, () => {
          if (!newVideo) {
            hls.startLoad(localBookmark)
          } else {
            hls.startLoad()
          }
        })

        hls.on(HlsJS.Events.ERROR, (e, { details }) => {
          if (details === ErrorDetails.MANIFEST_LOAD_ERROR) {
            setFallback(true)
          }
        })

        hls.on(HlsJS.Events.LEVEL_LOADED, (e, data) => updateDuration(data.details.totalduration))
      } else {
        setFallback(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (fallback) {
      const player = getPlayer() as unknown as HTMLVideoElement & { media: HTMLVideoElement }

      player.media.src = `${serverConfig.api}/video/${video.id}`
      player.media.ondurationchange = () => updateDuration(player.media.duration)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback])

  const handleWheel = (e: React.WheelEvent) => {
    const multiplier = 10

    getPlayer().currentTime += multiplier * Math.sign(e.deltaY) * -1
  }
  const copy = async () => await navigator.clipboard.writeText(video.path.file.slice(0, -4))

  const resetPlays = () => {
    videoService.resetPlays(video.id).then(() => {
      router.refresh()
    })
  }

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

  const setCover = (url: string) => {
    videoService.setCover(video.id, url).then(() => {
      router.refresh()
    })
  }

  const addBookmark = (category: Category) => {
    const time = Math.round(getPlayer().currentTime)
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
              attributes: typeof data.attributes !== 'undefined' ? data.attributes : [],
              active: false,
              outfit: null
            }
          ].sort((a, b) => a.start - b.start)
        )
      })
    }
  }

  return (
    <div className='video-container' onWheel={handleWheel}>
      <ContextMenuTrigger id='video' holdToDisplay={-1}>
        <Plyr
          plyrRef={plyrRef as React.MutableRefObject<Plyr>}
          source={`${serverConfig.api}/video/${video.id}/file`}
          thumbnail={`${serverConfig.api}/video/${video.id}/vtt`}
        />
      </ContextMenuTrigger>

      <ContextMenu id='video'>
        <MenuItem
          disabled={video.noStar}
          onClick={() => {
            modal.handler(
              'Add Bookmark',
              categories.map(category => {
                return (
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
                )
              }),
              true
            )
          }}
        >
          <Icon code='add' /> Add Bookmark
        </MenuItem>

        <MenuItem onClick={censorToggle}>
          {video.censored ? (
            <>
              <Icon code='toggle-yes' /> UnCensor
            </>
          ) : (
            <>
              <Icon code='toggle-no' /> Censor
            </>
          )}
        </MenuItem>
        <MenuItem onClick={resetPlays}>
          <Icon code='trash' /> Remove Plays
        </MenuItem>

        <MenuItem
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
                    renameVideo(e.target.value)
                  }
                }}
              />
            )
          }}
        >
          <Icon code='edit' /> Rename Video
        </MenuItem>

        <MenuItem divider />

        <MenuItem onClick={() => void copy()}>
          <Icon code='copy' /> Copy Filename
        </MenuItem>

        <MenuItem divider />

        <MenuItem
          onClick={() => {
            modal.handler(
              'Set Cover',
              <TextField
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    modal.handler()

                    //@ts-expect-error: target is undefined in MUI
                    setCover(e.target.value)
                  }
                }}
              />
            )
          }}
        >
          <Icon code='edit' /> Set Cover
        </MenuItem>

        <MenuItem onClick={updateVideo}>
          <Icon code='edit' /> Update Video
        </MenuItem>

        <MenuItem divider />

        <MenuItem disabled={stars.length !== 0} onClick={deleteVideo}>
          <Icon code='trash' /> Delete Video
        </MenuItem>
      </ContextMenu>
    </div>
  )
}

export default VideoPlayer
