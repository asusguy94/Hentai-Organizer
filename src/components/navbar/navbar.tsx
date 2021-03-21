import { Link } from 'react-router-dom'

import './navbar.scss'

import config from '../config.json'

const NavBar = () => (
	<nav>
		<ul className='main-menu'>
			<NavBarItem name='Home' path='/' />

			<NavBarItem name='Video Search' path='/video/search'>
				<NavBarItem name='Videos' path='/video' />
			</NavBarItem>

			<NavBarItem name='Star Search' path='/star/search' />

			<NavBarItem name='DB Editor' path='/editor' />

			<NavBarItem name='DB' path={config.db} remote={true} />
			<NavBarItem name='Import Videos' path='/video/add' />
		</ul>
	</nav>
)

const NavBarItem = ({ name, path, children, disabled = false, remote = false }: any) => {
	if (!disabled) {
		return (
			<li>
				{!remote ? <Link to={path}>{name}</Link> : <a href={path}>{name}</a>}
				{children ? <ul className='sub-menu'>{children}</ul> : null}
			</li>
		)
	}

	return null
}

export default NavBar
