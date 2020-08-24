import React, { Component } from 'react'

import Axios from 'axios'

import config from '../config.json'

// TODO get count
export class AttributesPage extends Component {
    state = {
        attributes: [],
        loaded: false,
    }

    componentDidMount() {
        this.getData()
    }

    render() {
        return (
            <div id='editor-page' className='col-12'>
                <h2>Attributes Page</h2>

                <Attributes data={this.state.attributes} />
            </div>
        )
    }

    getData() {
        Axios.get(`${config.api}/attributes.php`).then(({ data: attributes }) => {
            attributes.sort((a, b) => {
                return a.id - b.id
            })
            this.setState({ attributes })
        })
    }
}

class Attribute extends Component {
    render() {
        return (
            <tr>
                <th>{this.props.data.id}</th>
                <td>{this.props.data.name}</td>
            </tr>
        )
    }
}

// TODO change name, remove if empty
class Attributes extends Component {
    render() {
        return (
            <table className='table table-sm table-striped'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Attribute</th>
                    </tr>
                </thead>

                <tbody>
                    {this.props.data.map((item, i) => (
                        <Attribute key={i} data={item} />
                    ))}
                </tbody>
            </table>
        )
    }
}

export class CategoriesPage extends Component {
    render() {
        return (
            <div>
                <h2>Categories Page</h2>
            </div>
        )
    }
}
