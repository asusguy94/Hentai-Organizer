import React, { Component } from 'react'

import './ribbon.scss'

class Ribbon extends Component {
    render() {
        const { label } = this.props

        return label ? <span className='ribbon'>{label}</span> : null
    }
}

export default Ribbon
