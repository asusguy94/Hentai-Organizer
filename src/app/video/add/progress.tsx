import { useEffect, useState } from 'react'

import MuiProgress from '@components/progress/progress'

import socket from '@utils/pusher/client'
import { EventsForChannel } from '@utils/pusher/types'

//TODO extract ProgressBuffer instead of hardcoding "ffmpeg"
type ProgressItemProps = { event: EventsForChannel<'ffmpeg'>['name']; label: string }

function ProgressItem({ event, label }: ProgressItemProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const channel = socket.subscribe('ffmpeg', { name: event, callback: log => setProgress(log.progress) })

    return () => {
      socket.unsubscribe(channel)
    }
  }, [event])

  return <MuiProgress label={label} value={Math.floor(progress * 100)} />
}

export default function Progress() {
  return (
    <div style={{ padding: '1em' }}>
      <ProgressItem event='vtt' label='Thumbnails' />
      <ProgressItem event='generate-video' label='Generate Video' />
    </div>
  )
}
