import { RefObject, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import { Button, TextField } from '@mui/material'

import axios from 'axios'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import HlsJS, { ErrorDetails } from 'hls.js'
import { useKey } from 'react-use'
import { useSessionStorage } from 'usehooks-ts'

import type { IModal, IModalHandler } from '../modal'
import Icon from '../icon'
import Plyr from '../plyr'

import { IBookmark, ICategory, IVideo, IVideoStar, ISetState } from '@interfaces'

import { serverConfig } from '@config'

interface VideoPlayerProps {
  video: IVideo
  bookmarks: IBookmark[]
  categories: ICategory[]
  stars: IVideoStar[]
  update: {
    video: ISetState<IVideo | undefined>
    bookmarks: ISetState<IBookmark[]>
  }
  updateDuration: (duration: number) => void
  plyrRef: RefObject<any>
  modal: {
    handler: IModalHandler
    data: IModal
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

  const getPlayer = () => plyrRef.current

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

          axios
            .put(`${serverConfig.api}/video/${video.id}`, { plays: 1 })
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
      const player = getPlayer()

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
      const player = getPlayer()

      player.media.source = `${serverConfig.api}/video/${video.id}`
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
    axios.put(`${serverConfig.api}/video/${video.id}`, { plays: 0 }).then(() => {
      router.reload()

      //TODO use stateObj instead
    })
  }

  const deleteVideo = () => {
    axios.delete(`${serverConfig.api}/video/${video.id}`).then(() => {
      router.replace('/video')

      //TODO use stateObj instead
    })
  }

  const renameVideo = (path: string) => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { path }).then(() => {
      router.reload()

      //TODO use stateObj instead
    })
  }

  const censorToggle = () => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { cen: !video.censored }).then(() => {
      update.video({ ...video, censored: !video.censored })
    })
  }

  const updateVideo = () => {
    axios.put(`${serverConfig.api}/video/${video.id}`).then(() => {
      router.reload()

      //TODO use stateObj instead
    })
  }

  const setCover = (url: string) => {
    axios.put(`${serverConfig.api}/video/${video.id}`, { cover: url }).then(() => {
      router.reload()
    })
  }

  const addBookmark = (category: ICategory) => {
    const time = Math.round(getPlayer().currentTime)
    if (time) {
      axios
        .post(`${serverConfig.api}/video/${video.id}/bookmark`, {
          categoryID: category.id,
          time
        })
        .then(({ data }) => {
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
          plyrRef={plyrRef}
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
