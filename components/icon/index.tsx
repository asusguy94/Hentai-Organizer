import { themeConfig } from '@config'

type IconProps = {
  code: keyof typeof themeConfig
}

const Icon = ({ code }: IconProps) => <i className={themeConfig[code]} />

export default Icon
