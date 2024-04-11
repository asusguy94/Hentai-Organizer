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
          <Link to='/video/search' search={{ nullCategory: 1 }}>
            Video Search
          </Link>

          <ul className={styles.sub}>
            <li>
              <Link to='/video'>Videos</Link>
            </li>
          </ul>
        </li>

        <li>
          <Link to='/star/search'>Star Search</Link>
        </li>
      </ul>

      <ul>
        <li>
          <Link to='/settings'>Settings</Link>
        </li>

        <li>
          <Link to='/editor'>DB Editor</Link>
        </li>

        <li>
          <Link to='/video/add'>Import Videos</Link>
        </li>
      </ul>
    </nav>
  )
}
