import React, { Component } from 'react'

class VideoPlayer extends Component {
    render() {
        return (
            <video controls={true} preload='auto' style={{ width: '100%', height: '100%' }}>
                <source src='https://hentai.ds1517/videos/Residence Episode 1.mp4' />
            </video>
        )
    }
}

export default VideoPlayer
