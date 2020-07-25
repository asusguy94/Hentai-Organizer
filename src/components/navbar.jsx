import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './styles/navbar.scss'

import config from './config.json'

class NavBar extends Component {
    render() {
        return (
            <nav>
                <ul className='main-menu'>
                    <li>
                        <Link to='/'>Home</Link>
                    </li>

                    <li>
                        <a href={`${config.source}/add_videos.php`} target='_blank'>
                            Add Videos
                        </a>
                    </li>

                    <li>
                        <Link to='/videos/search'>Video Search</Link>
                        <ul className='sub-menu'>
                            <li>
                                <Link to='/videos'>Videos</Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <Link to='/stars/search'>Star Search</Link>
                        <ul className='sub-menu'>
                            <li>
                                <a href={`${config.source}/stars.php`} target='_blank'>
                                    Stars
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <a href={`${config.source}/video_generatethumbnails.php`} target='_blank'>
                            Generate Thumbnails
                        </a>
                        <ul className='sub-menu'>
                            <li>
                                <a href={`${config.source}/vtt.php`} target='_blank'>
                                    Generate WebVTT
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <a href='https://ds1517/phpMyAdmin' target='_blank'>
                            DB
                        </a>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default NavBar
