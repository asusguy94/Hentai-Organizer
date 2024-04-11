import { useEffect, useMemo, useRef } from 'react'

import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  Poster,
  Track,
  VTTContent,
  isHLSProvider,
  useMediaRemote,
  useMediaState
} from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import Hls, { ErrorData } from 'hls.js'
import { toast } from 'react-toastify'

import { CustomStorage } from './storage'

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

  const currentTime = useMediaState('currentTime', playerRef)

  const lastPlayAddedRef = useRef<number | null>(null)

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
      provider.config = { maxBufferLength: Infinity }
    }

    onReady()
  }

  const onHlsError = (detail: ErrorData) => {
    if (detail.fatal) {
      hlsRef.current?.destroy()
    }
  }

  const customStorage = useMemo(() => new CustomStorage(), [])

  useEffect(() => {
    customStorage.updateVideoId(videoId)
  }, [customStorage, videoId])

  const onPlay = () => {
    // TODO lastPlayAddedRef.current breaks if the user refreshes the page
    if (customStorage.canAddPlay() && lastPlayAddedRef.current !== videoId) {
      videoService.addPlay(videoId).then(() => {
        toast.success('Play added', { autoClose: 500 })

        lastPlayAddedRef.current = videoId
        customStorage.resetCanAddPlay()
      })
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
      storage={customStorage}
      onPlay={onPlay}
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
        {poster !== undefined && currentTime < 1 && <Poster className='vds-poster' src={poster} alt={title} />}
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
