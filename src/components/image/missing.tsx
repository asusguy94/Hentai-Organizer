import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'

type MissingImageProps = {
  scale?: number
  renderStyle?: 'transform'
}

export default function MissingImage({ scale = 1, renderStyle }: MissingImageProps) {
  if (scale <= 0) throw new Error('Scale must be greater than zero')

  return (
    <ImageNotSupportedOutlinedIcon
      color='action'
      fontSize='large'
      style={{
        ...(renderStyle === 'transform' ? { transform: 'translateY(50%)' } : {}),
        scale: scale.toString()
      }}
    />
  )
}
