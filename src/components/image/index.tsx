import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import { CardMedia as MUICardMedia } from '@mui/material'

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>

export function ResponsiveImage({ alt, style, ...other }: ImgProps & MissingImage & MissingImageProps) {
  return <Image style={{ ...style, width: '100%', height: 'auto' }} alt={alt} {...other} />
}

export default function Image({
  missing,
  scale,
  renderStyle,
  alt = '',
  ...props
}: ImgProps & MissingImage & MissingImageProps) {
  if (missing) return <MissingImage scale={scale} renderStyle={renderStyle} />

  return <img alt={alt} {...props} />
}

type CardProps = {
  height: number
  alt: string
  responsive?: boolean
}

export function ImageCard({
  height,
  alt,
  missing = false,
  responsive = false,
  renderStyle = 'height',
  ...other
}: CardProps & ImgProps & MissingImage & MissingImageProps) {
  return (
    <MUICardMedia style={missing ? { height, textAlign: 'center' } : {}}>
      {responsive ? (
        <ResponsiveImage alt={alt} height={height} missing={missing} renderStyle={renderStyle} {...other} />
      ) : (
        <Image alt={alt} height={height} missing={missing} renderStyle={renderStyle} {...other} />
      )}
    </MUICardMedia>
  )
}

type MissingImage = {
  missing?: boolean
}

type MissingImageProps = {
  scale?: number
  renderStyle?: 'height' | 'transform'
}

function MissingImage({ scale = 1, renderStyle }: MissingImageProps) {
  if (scale <= 0) throw new Error('Scale must be greater than zero')

  return (
    <ImageNotSupportedOutlinedIcon
      color='action'
      fontSize='large'
      style={{
        ...(renderStyle === 'height'
          ? { height: '100%' }
          : renderStyle === 'transform'
            ? { transform: 'translateY(50%)' } //TODO why 50%
            : {}),
        scale: scale.toString()
      }}
    />
  )
}
