import styles from './ribbon.module.scss'

interface RibbonProps {
  label: string
}
const Ribbon = ({ label }: RibbonProps) => {
  if (label.length === 0) return null

  return <span className={`${styles.ribbon} unselectable`}>{label}</span>
}

interface ContainerProps {
  children: React.ReactNode
  component?: React.ElementType
  className?: string
  style?: React.CSSProperties
}
export const RibbonContainer = ({
  children,
  component: Component = 'div',
  className = '',
  ...other
}: ContainerProps) => (
  <Component className={`${styles.container} ${className}`} {...other}>
    {children}
  </Component>
)

export default Ribbon
