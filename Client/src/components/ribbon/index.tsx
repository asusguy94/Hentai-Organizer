import styles from './ribbon.module.scss'

type RibbonProps = {
  label: string
}
export default function Ribbon({ label }: RibbonProps) {
  if (label.length === 0) return null

  return <span className={`${styles.ribbon} unselectable`}>{label}</span>
}

type ContainerProps = {
  children: React.ReactNode
  component?: React.ElementType
  className?: string
  style?: React.CSSProperties
}
export function RibbonContainer({ children, component: Component = 'div', className = '', ...other }: ContainerProps) {
  return (
    <Component className={`${styles.container} ${className}`} {...other}>
      {children}
    </Component>
  )
}
