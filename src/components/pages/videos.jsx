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
            <div className='col-12'>
                {Object.keys(this.state.data).map((key, i) => (
                    <li key={i} className='list-group-item list-group-item'>
                        <a href={`${config.api}/video/${this.state.data[key].id}`}>
                            {this.state.data[key].name}
                        </a>
                    </li>
                ))}
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData(limit = this.state.limit) {
        Axios.get(`${config.api}/videos.php?limit=${limit}`).then(({ data }) =>
            this.setState({ data })
        )
    }
}

export default VideosPage
