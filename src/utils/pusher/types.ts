export type Channel = 'ffmpeg' | 'logs'

type ChannelEvents = {
  ffmpeg: 'vtt' | 'generate-video'
  logs: 'new-log'
}

type ProgressBuffer = { progress: number; buffer?: number }

export type Message = {
  vtt: ProgressBuffer
  'generate-video': ProgressBuffer
  'new-log': { message: string }
}

type Events = {
  [K in keyof ChannelEvents]: { name: ChannelEvents[K]; callback: (message: Message[ChannelEvents[K]]) => void }
}

export type EventsForChannel<T extends Channel> = Extract<Events[T], { name: ChannelEvents[T] }>
export type MessageTypeForKey<K extends keyof Message> = Message[K]
