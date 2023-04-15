import { useEffect } from 'react'

import Plyr from 'plyr'

import { settingsConfig } from '@config'

type PlyrProps = {
  plyrRef: React.MutableRefObject<Plyr | null>
  source: string
  thumbnail: string
}
export const PlyrComponent = ({ plyrRef, source, thumbnail }: PlyrProps) => {
  useEffect(() => {
    const player = new Plyr('.plyr-js', {
      controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'settings'],
      settings: ['speed'],
      speed: { selected: 1, options: [0.75, 1, 1.25] },
      hideControls: false,
      ratio: '21:9',
      keyboard: { focused: false },
      fullscreen: { enabled: false },
      previewThumbnails: {
        enabled: settingsConfig.player.thumbnails,
        src: thumbnail
      }
    })

    plyrRef.current = player

    return () => {
      plyrRef.current = null

      player.destroy()
    }
  }, [plyrRef, thumbnail])

  return <video className='plyr-js' src={source} />
}

export type PlyrWithMetadata = Plyr & { media: HTMLVideoElement }
export default PlyrComponent
