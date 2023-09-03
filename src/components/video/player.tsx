import { useRouter } from 'next/navigation'
import { RefObject, useEffect, useRef, useState } from 'react'

import { Button, TextField } from '@mui/material'

import Hls, { HlsConfig, HlsListeners } from 'hls.js'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'
import { useKey } from 'react-use'
import { useSessionStorage } from 'usehooks-ts'

import { IconWithText } from '../icon'
import { Modal, ModalHandler } from '../modal'
import Plyr, { PlyrWithMetadata } from '../plyr'

import { serverConfig, settingsConfig } from '@config'
import { Bookmark, Category, Video, VideoStar, SetState } from '@interfaces'
import { videoService } from '@service'

function useHls(video: Video, plyrRef: React.MutableRefObject<PlyrWithMetadata | null>, hlsConfig: Partial<HlsConfig>) {
  const playAddedRef = useRef(false)
  const newVideoRef = useRef(false)

  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  const [events, setEvents] = useState(false)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    if (plyrRef.current !== null) {
      newVideoRef.current = localVideo !== video.id
      if (localVideo !== video.id) {
        setLocalVideo(video.id)
        setLocalBookmark(0)
      }
      setEvents(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plyrRef])

  useEffect(() => {
    if (plyrRef.current === null) return

    if (events) {
      const player = plyrRef.current

      const onTimeupdate = () => {
        if (player.currentTime > 0) {
          setLocalBookmark(Math.round(player.currentTime))
        }
      }

      const onPlay = () => {
        if (newVideoRef.current && !playAddedRef.current) {
          playAddedRef.current = true

          videoService
            .addPlays(video.id)
            .then(() => {
              console.log('Play Added')
            })
            .catch(() => {
              playAddedRef.current = false
            })
        }
      }

      player.on('timeupdate', onTimeupdate)
      player.on('play', onPlay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (plyrRef.current === null) return

    if (events) {
      const player = plyrRef.current

      if (Hls.isSupported()) {
        const hls = new Hls(hlsConfig)

        hls.loadSource(`${serverConfig.api}/video/${video.id}/hls`)
        hls.attachMedia(player.media)

        const onLoad: HlsListeners[typeof Hls.Events.MANIFEST_PARSED] = (e, data) => {
          if (settingsConfig.debug) {
            console.log(e, data)
          }

          const maxLevel = data.levels.filter(level => level.height <= settingsConfig.player.quality.max).length - 1

          hls.startLevel = maxLevel - 1
          hls.autoLevelCapping = maxLevel

          hls.startLoad(localBookmark)
        }

        const onError: HlsListeners[typeof Hls.Events.ERROR] = (e, data) => {
          if (settingsConfig.debug) {
            console.log(e, data)
          }

          if (data.fatal) {
            hls.off(Hls.Events.ERROR, onError)
            hls.off(Hls.Events.MANIFEST_PARSED, onLoad)
            setFallback(true)
          }
        }

        hls.once(Hls.Events.MANIFEST_PARSED, onLoad)
        hls.on(Hls.Events.ERROR, onError)
      } else {
        setFallback(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (plyrRef.current === null) return

    if (fallback) {
      plyrRef.current.media.src = `${serverConfig.api}/video/${video.id}/file`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback])
}

type VideoPlayerProps = {
  video: Video
  bookmarks: Bookmark[]
  categories: Category[]
  stars: VideoStar[]
  update: {
    video: SetState<Video | undefined>
    bookmarks: SetState<Bookmark[]>
  }
  playerRef: RefObject<HTMLVideoElement>
  plyrRef: RefObject<PlyrWithMetadata | null>
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
  plyrRef,
  modal
}: VideoPlayerProps) {
  const router = useRouter()

  useHls(video, plyrRef, { maxBufferLength: Infinity, autoStartLoad: false })

  const isArrow = (e: KeyboardEvent) => /^Arrow(Left|Right|Up|Down)$/.test(e.code)
  const isMute = (e: KeyboardEvent) => e.code === 'KeyM'
  const isSpace = (e: KeyboardEvent) => e.code === 'Space'

  const getPlayer = () => plyrRef.current

  useKey(
    e => !modal.data.visible && (isArrow(e) || isMute(e) || isSpace(e)),
    e => {
      const player = getPlayer()

      if (player === null || (e.target as HTMLElement).tagName === 'INPUT') return

      e.preventDefault()

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

  const handleWheel = (e: React.WheelEvent) => {
    if (plyrRef.current === null) return

    plyrRef.current.currentTime += 10 * Math.sign(e.deltaY) * -1
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
    if (plyrRef.current === null) return

    const time = Math.round(plyrRef.current.currentTime)
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

  return (
    <div onWheel={handleWheel}>
      <ContextMenuTrigger id='video'>
        <Plyr
          playerRef={playerRef}
          plyrRef={plyrRef}
          source={`${serverConfig.api}/video/${video.id}/file`}
          thumbnail={`${serverConfig.api}/video/${video.id}/vtt`}
          poster={`${serverConfig.api}/video/${video.id}/poster`}
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

        <IconWithText component={ContextMenuItem} icon='delete' text='Remove Plays' onClick={resetPlays} />

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
    </div>
  )
}
