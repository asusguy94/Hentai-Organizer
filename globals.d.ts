declare module 'react-contextmenu' {
  interface ContextMenuProps {
    children: React.ReactNode
  }

  interface ContextMenuTriggerProps {
    children: React.ReactNode
  }

  interface MenuItemProps {
    children?: React.ReactNode
  }
}

declare module 'get-video-dimensions' {
  function placeholder(file: string): Promise<{ width: number; height: number }>
  export = placeholder
}

declare module 'ffmpeg-generate-video-preview' {
  interface IArgs {
    input: string
    output: string
    width?: number
    height?: number
    quality?: number
    numFrames?: number
    numFramesPercent?: number
    rows?: number
    cols?: number
    padding?: number
    margin?: number
    color?: number
    gifski?: {
      fps?: number
      quality?: number
      fast?: boolean
    }
    log?: (message: string) => void
  }

  function placeholder(args: IArgs): Promise<{
    output: string
    numFrames: number
    width: number
    height: number
    rows: number
    cols: number
  }>
  export = placeholder
}

declare module 'ffmpeg-extract-frame' {
  interface IArgs {
    input: string
    output: string
    offset?: number
    quality?: number
    log?: (message: string) => void
  }

  function placeholder(args: IArgs): Promise<void>
  export = placeholder
}
