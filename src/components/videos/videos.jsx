import React, { Component } from 'react'
import Axios from 'axios'

import config from '../config'

class VideosPage extends Component {
    state = {
        limit: 100,
        data: [],
    }

    render() {
        return (
            <div className='col'>
                <div className='list-group'>
                    {this.state.data.map((video, i) => (
                        <li key={i} className='list-group-item list-group-item-action'>
                            <a href={`video/${video.id}`}>{video.name}</a>
                        </li>
                    ))}
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData(limit = this.state.limit) {
        Axios.get(`${config.api}/videos.php?limit=${limit}`).then(({ data }) => this.setState({ data }))
    }
}

export default VideosPage
