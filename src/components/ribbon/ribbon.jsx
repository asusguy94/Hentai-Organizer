import React, { Component } from 'react'

class Ribbon extends Component {
    render() {
        const { label } = this.props

        if (label) return <span className='ribbon'>{label}</span>

        return null
    }
}

export default Ribbon
