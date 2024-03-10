import { Link } from '@tanstack/react-router'

import styles from './navbar.module.scss'

export default function NavBar() {
  return (
    <nav id={styles.navbar}>
      <ul>
        <li>
          <Link to='/'>Home</Link>
        </li>

        <li>
          {/* <NavBarItem name='Video Search' path='/video/search?nullCategory=1'> */}
          <Link to='/'>Video Search</Link>

          <ul className={styles.sub}>
            <li>
              <Link to='/video'>Videos</Link>
            </li>
          </ul>
          {/* </NavBarItem> */}
        </li>

        <li>
          <Link to='/'>Star Search</Link>
          {/* <NavBarItem name='Star Search' path='/star/search' /> */}
        </li>
      </ul>

      <ul>
        <li>
          <Link to='/'>Settings</Link>
          {/* <NavBarItem name='Settings' path='/settings' /> */}
        </li>

        <li>
          <Link to='/editor'>DB Editor</Link>
        </li>

        <li>
          {/* <NavBarItem name='Import Videos' path='/video/add' /> */}
          <Link to='/'>Import Videos</Link>
        </li>
      </ul>
    </nav>
  )
}
