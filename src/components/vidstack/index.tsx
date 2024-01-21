import { useEffect, useRef } from 'react'

import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  MediaTimeUpdateEventDetail,
  MediaVolumeChange,
  Poster,
  isHLSProvider
} from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import Hls, { ErrorData, ManifestParsedData } from 'hls.js'
import { useLocalStorage, useSessionStorage } from 'usehooks-ts'

import { Modal } from '@components/modal'

import { settingsConfig } from '@config'
import { Video } from '@interfaces'
import { videoService } from '@service'

import './vidstack.css'

type PlayerProps = {
  title: string
  src: { video: string; hls: string }
  poster?: string
  thumbnails?: string
  video: Video
  playerRef: React.RefObject<MediaPlayerInstance>
  modal: Modal
}

export default function Player({ title, src, poster, thumbnails, video, playerRef, modal }: PlayerProps) {
  const hlsRef = useRef<Hls>()
  const [config, setConfig] = useLocalStorage('config', { volume: 1 })

  const playAddedRef = useRef(false)
  const newVideoRef = useRef(false)

  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  useEffect(() => {
    newVideoRef.current = localVideo !== video.id
    if (newVideoRef.current) {
      setLocalVideo(video.id)
      setLocalBookmark(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerRef])

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

  const onPlay = () => {
    if (newVideoRef.current && !playAddedRef.current) {
      playAddedRef.current = true

      videoService
        .addPlays(video.id)
        .then(() => {
          console.log('play added')
        })
        .catch(() => {
          playAddedRef.current = false
        })
    }
  }

  const onManifestParsed = (data: ManifestParsedData) => {
    if (hlsRef.current === undefined) return

    const maxLevel = data.levels.filter(level => level.height <= settingsConfig.player.quality.max).length - 1
    hlsRef.current.startLevel = maxLevel - 1
    hlsRef.current.autoLevelCapping = maxLevel

    hlsRef.current.startLoad(localBookmark)
  }

  const onHlsError = (detail: ErrorData) => {
    if (settingsConfig.debug) {
      console.log(detail)
    }

    if (detail.fatal) {
      hlsRef.current?.destroy()
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    if (playerRef.current === null) return

    playerRef.current.currentTime += 10 * Math.sign(e.deltaY) * -1
  }

  const onVolumeChange = (details: MediaVolumeChange) => {
    setConfig({ ...config, volume: details.volume })
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
      onProviderChange={onProviderChange}
      onTimeUpdate={onTimeUpdate}
      onPlay={onPlay}
      onWheel={onWheel}
      onHlsManifestParsed={onManifestParsed}
      onHlsInstance={hls => (hlsRef.current = hls)}
      onHlsError={onHlsError}
      keyTarget='document'
      keyDisabled={modal.visible}
      keyShortcuts={{
        togglePaused: ['Space'],
        toggleMuted: ['m'],
        seekBackward: {
          keys: ['ArrowLeft'],
          callback(e) {
            if (playerRef.current !== null && e.type === 'keydown') {
              playerRef.current.currentTime -= 1
            }
          }
        },
        seekForward: {
          keys: ['ArrowRight'],
          callback(e) {
            if (playerRef.current !== null && e.type === 'keydown') {
              playerRef.current.currentTime += 1
            }
          }
        },
        volumeUp: ['ArrowUp'],
        volumeDown: ['ArrowDown']
      }}
      volume={config.volume}
      onVolumeChange={onVolumeChange}
    >
      <MediaProvider>
        {poster !== undefined && <Poster className='vds-poster' src={poster} alt={title} />}
      </MediaProvider>

      <DefaultVideoLayout thumbnails={thumbnails} icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}

export type { MediaPlayerInstance }
