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

import { Modal } from '@/components/modal'

import { Bookmark, Video } from '@/interface'

import './vidstack.css'

type PlayerProps = {
  title: string
  src: { video: string; hls: string }
  poster?: string
  thumbnails?: string
  video: Video
  bookmarks: Bookmark[]
  playerRef: React.RefObject<MediaPlayerInstance>
  modal: Modal
}

export default function Player({ title, src, poster, thumbnails, video, playerRef, modal, bookmarks }: PlayerProps) {
  const remote = useMediaRemote(playerRef)
  const hlsRef = useRef<Hls>()

  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  useEffect(() => {
    if (localVideo !== video.id) {
      setLocalVideo(video.id)
      setLocalBookmark(0)
    }
  }, [localVideo, setLocalBookmark, setLocalVideo, video.id])

  const chapters = useMemo<VTTContent>(() => {
    return {
      cues: bookmarks.map((bookmark, idx, arr) => ({
        startTime: bookmark.start,
        endTime: arr.at(idx + 1)?.start ?? video.duration,
        text: bookmark.name
      }))
    }
  }, [bookmarks, video.duration])

  const onProviderChange = (provider: MediaProviderAdapter | null) => {
    if (provider === null) return

    if (isHLSProvider(provider)) {
      provider.library = () => import('hls.js')
      provider.config = { maxBufferLength: Infinity, autoStartLoad: false }
    }
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

  const onWheel = (e: React.WheelEvent) => {
    if (playerRef.current === null) return

    playerRef.current.currentTime += 10 * Math.sign(e.deltaY) * -1
  }

  return (
    <MediaPlayer
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
      onTimeUpdate={onTimeUpdate}
      onWheel={onWheel}
      onHlsManifestParsed={onManifestParsed}
      onHlsInstance={hls => (hlsRef.current = hls)}
      onHlsError={onHlsError}
      keyTarget='document'
      keyDisabled={modal.visible}
      keyShortcuts={{
        toggleMuted: 'm',
        volumeUp: 'ArrowUp',
        volumeDown: 'ArrowDown',
        seekBackward: 'ArrowLeft',
        seekForward: 'ArrowRight',
        togglePaused: {
          keys: 'Space',
          callback(e) {
            if (e.type === 'keyup') {
              remote.togglePaused()
            }
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
        seekStep={1}
        slots={{ googleCastButton: null, pipButton: null, fullscreenButton: null }}
        noScrubGesture={false}
      />
    </MediaPlayer>
  )
}

export type { MediaPlayerInstance }
