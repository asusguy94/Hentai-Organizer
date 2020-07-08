import React, {Component} from 'react'
import {Redirect} from "react-router-dom"
import Axios from "axios"

import config from "../config"

class RandomVideoPage extends Component {
    state = {
        redirect: false,
        video: {}
    }

    render() {
        return (
            this.state.redirect && <Redirect to={`/video/${this.state.video["id"]}`}/>
        )
    }

    componentDidMount() {
        this.getData()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.state)
    }

    getData() {
        Axios.get(`${config.api}/random.php`)
            .then(({data}) => {
                this.setState({video: data, redirect: true})
            })
    }

}

export default RandomVideoPage
