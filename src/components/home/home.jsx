import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import './home.scss'

import config from '../config'

class HomeColumn extends Component {
    render() {
        const { obj } = this.props

        if (obj.enabled) {
            return (
                <section className='col-12'>
                    <h2>
                        {obj.label} Videos (<span className='count'>{obj.data.length}</span>)
                    </h2>

                    <div className='row'>
                        {obj.data.map((video, i) => (
                            <div className='mx-0 px-2 col-1 row' key={i}>
                                <Link className='video col-12 px-0 ribbon-container' to={`/video/${video.id}`}>
                                    <img
                                        className='mx-auto img-thumbnail'
                                        alt='video'
                                        src={`${config.source}/images/videos/${video.id}-290`}
                                    />

                                    <span className='video__title mx-auto d-block'>{video.name}</span>

                                    {video.plays > 0 && <span className='ribbon'>{video.plays}</span>}
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )
        }
        return null
    }
}

class HomePage extends Component {
    state = {
        recent: {
            label: 'Recent',
            enabled: false,
            limit: 24,
            data: [],
        },
        newest: {
            label: 'Newest',
            enabled: false,
            limit: 24,
            data: [],
        },
        popular: {
            label: 'Popular',
            enabled: true,
            limit: 36,
            data: [],
        },
        random: {
            label: 'Random',
            enabled: true,
            limit: 24,
            data: [],
        },
    }

    render() {
        return (
            <div className='home-page'>
                {Object.keys(this.state).map((key, i) => (
                    <HomeColumn obj={this.state[key]} key={i} />
                ))}
            </div>
        )
    }

    componentDidMount() {
        Object.keys(this.state).forEach((key) => {
            if (this.state[key].enabled) this.getData(key)
        })
    }

    getData(type, limit = this.state[type].limit) {
        Axios.get(`${config.api}/home.php?type=${type}&limit=${limit}`).then(({ data }) => {
            this.setState((prevState) => {
                const object = prevState[type]
                object.data = data

                return { [type]: object }
            })
        })
    }
}

export default HomePage
