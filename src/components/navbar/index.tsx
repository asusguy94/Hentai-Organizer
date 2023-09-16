import Link from '../link'

import styles from './navbar.module.scss'

export default function NavBar() {
  return (
    <nav id={styles.navbar}>
      <ul>
        <NavBarItem name='Home' path='/' />

        <NavBarItem name='Video Search' path='/video/search?nullCategory=1'>
          <NavBarItem name='Videos' path='/video' />
        </NavBarItem>

        <NavBarItem name='Star Search' path='/star/search' />
      </ul>

      <ul>
        <NavBarItem name='Settings' path='/settings' />
        <NavBarItem name='DB Editor' path='/editor' />
        <NavBarItem name='Import Videos' path='/video/add' />
      </ul>
    </nav>
  )
}

type NavBarItemProps = {
  name: string
  path: string
  disabled?: boolean
  children?: React.ReactNode
}
function NavBarItem({ name, path, children, disabled = false }: NavBarItemProps) {
  if (disabled) return null

  return (
    <li>
      <Link href={path}>{name}</Link>

      {children && <ul className={styles.sub}>{children}</ul>}
    </li>
  )
}
