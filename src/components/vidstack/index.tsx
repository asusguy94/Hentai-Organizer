import { useEffect, useMemo, useRef } from 'react'

import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  MediaTimeUpdateEventDetail,
  Poster,
  Track,
  VTTContent,
  isHLSProvider,
  useMediaRemote
} from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import Hls, { ErrorData } from 'hls.js'
import { useSessionStorage } from 'usehooks-ts'

import { useModalContext } from '@/context/modalContext'
import { videoService } from '@/service'

import './vidstack.css'

type PlayerProps = {
  videoId: number
  title: string
  src: { video: string; hls: string }
  poster?: string
  thumbnails?: string
  playerRef: React.RefObject<MediaPlayerInstance>
  onReady: () => void
}

export default function Player({ videoId, title, src, poster, thumbnails, playerRef, onReady }: PlayerProps) {
  const { data: video } = videoService.useVideo(videoId)
  const { data: bookmarks } = videoService.useBookmarks(videoId)

  const { modal } = useModalContext()

  const remote = useMediaRemote(playerRef)
  const hlsRef = useRef<Hls>()

  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  useEffect(() => {
    if (video === undefined) return

    if (localVideo !== video.id) {
      setLocalVideo(video.id)
      setLocalBookmark(0)
    }
  }, [localVideo, setLocalBookmark, setLocalVideo, video])

  const chapters = useMemo<VTTContent>(() => {
    if (bookmarks === undefined || video === undefined) return { cues: [] }

    return {
      cues: bookmarks.map((bookmark, idx, arr) => ({
        startTime: bookmark.start,
        endTime: arr.at(idx + 1)?.start ?? video.duration,
        text: bookmark.name
      }))
    }
  }, [bookmarks, video])

  const onProviderChange = (provider: MediaProviderAdapter | null) => {
    if (provider === null) return

    if (isHLSProvider(provider)) {
      provider.library = () => import('hls.js')
      provider.config = { maxBufferLength: Infinity, autoStartLoad: false }
    }

    onReady()
  }

  const onTimeUpdate = (detail: MediaTimeUpdateEventDetail) => {
    //TODO omitting this resets the video to the beginning every time
    if (detail.currentTime > 0) {
      setLocalBookmark(Math.round(detail.currentTime))
    }
  }

  const onManifestParsed = () => {
    if (hlsRef.current !== undefined) {
      hlsRef.current.startLoad(localBookmark)
    }
  }

  const onHlsError = (detail: ErrorData) => {
    if (detail.fatal) {
      hlsRef.current?.destroy()
    }
  }

  const seekStep = 1
  const seekToTime = (offset: number, player = remote.getPlayer()) => {
    if (player !== null) {
      remote.seek(player.currentTime + offset)
    }
  }

  return (
    <MediaPlayer
      onCanPlay={onReady}
      ref={playerRef}
      src={[
        { src: src.video, type: 'video/mp4' },
        { src: src.hls, type: 'application/x-mpegurl' }
      ]}
      streamType='on-demand'
      load='eager'
      viewType='video'
      storage='vidstack'
      onProviderChange={onProviderChange}
      onWheel={e => seekToTime(10 * Math.sign(e.deltaY) * -1)}
      onHlsInstance={hls => (hlsRef.current = hls)}
      onHlsError={onHlsError}
      keyTarget='document'
      keyDisabled={modal.visible}
      keyShortcuts={{
        toggleMuted: 'm',
        volumeUp: 'ArrowUp',
        volumeDown: 'ArrowDown',
        togglePaused: 'Space',
        seekBackward: {
          keys: 'ArrowLeft',
          onKeyDown({ player }) {
            seekToTime(-seekStep, player)
          }
        },
        seekForward: {
          keys: 'ArrowRight',
          onKeyDown({ player }) {
            seekToTime(seekStep, player)
          }
        }
      }}
    >
      <MediaProvider>
        {poster !== undefined && localBookmark === 0 && <Poster className='vds-poster' src={poster} alt={title} />}
        <Track kind='chapters' content={chapters} default type='json' />
      </MediaProvider>

      <DefaultVideoLayout
        thumbnails={thumbnails}
        icons={defaultLayoutIcons}
        seekStep={seekStep}
        slots={{ googleCastButton: null, pipButton: null, fullscreenButton: null }}
        noScrubGesture={false}
      />
    </MediaPlayer>
  )
}

export type { MediaPlayerInstance }
