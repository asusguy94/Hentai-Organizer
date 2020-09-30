import React, { Component } from 'react'

import Axios from 'axios'

import './editor.scss'

import config from '../config.json'

export class EditorPage extends Component {
    render() {
        return (
            <div id='editor-page' className='col-12 row'>
                <AttributesPage className='col-3' />
                <CategoriesPage className='col-3' />
            </div>
        )
    }
}

class AttributesPage extends Component {
    state = {
        input: '',
    }

    handleChange(e) {
        this.setState({ input: e.target.value })
    }

    handleSubmit() {
        const { input } = this.state

        if (input.length) {
            // lower case is not allowed -- make red border and display notice
            if (input.toLowerCase() === input) return false

            Axios.get(`${config.api}/addattribute.php?name=${input}`).then(() => {
                window.location.reload()

                // TODO use stateObj instead
            })
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.handleSubmit()
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                <header className='row'>
                    <h2 className='col-6'>Attributes Page</h2>

                    <div className='col-6 mt-1'>
                        <input
                            type='text'
                            className='col-6 pl-2'
                            ref={(input) => (this.input = input)}
                            onChange={this.handleChange.bind(this)}
                            onKeyPress={this.handleKeyPress.bind(this)}
                        />
                        <div className='btn btn-sm btn-primary float-right' onClick={this.handleSubmit.bind(this)}>
                            Add Attribute
                        </div>
                    </div>
                </header>

                <Attributes />
            </div>
        )
    }
}

class Attributes extends Component {
    state = {
        attributes: [],
    }

    componentDidMount() {
        this.getData()
    }

    updateAttribute(ref, value) {
        Axios.get(`${config.api}/editattribute.php?attributeID=${ref.id}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState(
                    this.state.attributes.filter((attribute) => {
                        if (ref.id === attribute.id) {
                            attribute.name = value
                        }

                        return attribute
                    })
                )
            }
        })
    }

    render() {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Attribute</th>
                        <th>starOnly</th>
                        <th>videoOnly</th>
                    </tr>
                </thead>

                <tbody>
                    {this.state.attributes.map((attribute, i) => (
                        <Attribute key={i} data={attribute} updateAttribute={(ref, value) => this.updateAttribute(ref, value)} />
                    ))}
                </tbody>
            </table>
        )
    }

    getData() {
        Axios.get(`${config.api}/attributes.php`).then(({ data: attributes }) => {
            attributes.sort((a, b) => a.id - b.id)
            this.setState({ attributes })
        })
    }
}

class Attribute extends Component {
    constructor() {
        super()
        this.state = { edit: false, value: null }
    }

    saveAttribute() {
        this.setState({ edit: false })

        if (this.state.value) {
            this.props.updateAttribute(this.props.data, this.state.value)
        }
    }

    handleConditionChange(e, attribute) {
        const value = Number(e.target.checked)

        // UPDATE starOnly / videoOnly
    }

    render() {
        const attribute = this.props.data
        const { id, name, starOnly, videoOnly } = attribute

        return (
            <tr>
                <th>{id}</th>
                <td
                    className='btn btn-link'
                    onClick={() => {
                        this.setState({ edit: true })
                    }}
                >
                    {this.state.edit ? (
                        <input
                            type='text'
                            defaultValue={name}
                            ref={(input) => input && input.focus()}
                            onBlur={this.saveAttribute.bind(this)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    this.saveAttribute()
                                }
                            }}
                            onChange={(e) => {
                                this.setState({ value: e.target.value })
                            }}
                        />
                    ) : (
                        <span>{name}</span>
                    )}
                </td>

                <td>
                    <input type='checkbox' defaultChecked={starOnly} onChange={(e) => this.handleConditionChange(e, attribute)} />
                </td>

                <td>
                    <input type='checkbox' defaultChecked={videoOnly} onChange={(e) => this.handleConditionChange(e, attribute)} />
                </td>
            </tr>
        )
    }
}

class CategoriesPage extends Component {
    state = {
        input: '',
    }

    handleChange(e) {
        this.setState({ input: e.target.value })
    }

    handleSubmit() {
        const { input } = this.state

        if (input.length) {
            // lower case is not allowed -- make red border and display notice
            if (input.toLowerCase() === input) return false

            Axios.get(`${config.api}/addcategory.php?name=${input}`).then(() => {
                window.location.reload()

                // TODO use stateObj instead
            })
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.handleSubmit()
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                <header className='row'>
                    <h2 className='col-6'>Categories Page</h2>

                    <div className='col-6 mt-1'>
                        <input
                            type='text'
                            className='col-6 pl-2'
                            ref={(input) => (this.input = input)}
                            onChange={this.handleChange.bind(this)}
                            onKeyPress={this.handleKeyPress.bind(this)}
                        />
                        <div className='btn btn-sm btn-primary float-right' onClick={this.handleSubmit.bind(this)}>
                            Add Category
                        </div>
                    </div>
                </header>

                <Categories />
            </div>
        )
    }
}

class Categories extends Component {
    state = {
        categories: [],
    }

    componentDidMount() {
        this.getData()
    }

    updateCategory(ref, value) {
        Axios.get(`${config.api}/editcategory.php?categoryID=${ref.id}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState(
                    this.state.categories.filter((category) => {
                        if (ref.id === category.id) {
                            category.name = value
                        }

                        return category
                    })
                )
            }
        })
    }

    render() {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Category</th>
                    </tr>
                </thead>

                <tbody>
                    {this.state.categories.map((category, i) => (
                        <Category key={i} data={category} updateCategory={(ref, value) => this.updateCategory(ref, value)} />
                    ))}
                </tbody>
            </table>
        )
    }

    getData() {
        Axios.get(`${config.api}/categories.php`).then(({ data: categories }) => {
            categories.sort((a, b) => a.id - b.id)
            this.setState({ categories })
        })
    }
}

class Category extends Component {
    constructor() {
        super()
        this.state = { edit: false, value: null }
    }

    saveCategory() {
        this.setState({ edit: false })

        if (this.state.value) {
            this.props.updateCategory(this.props.data, this.state.value)
        }
    }

    render() {
        const { id, name } = this.props.data

        return (
            <tr>
                <th>{id}</th>
                <td
                    className='btn btn-link'
                    onClick={() => {
                        this.setState({ edit: true })
                    }}
                >
                    {this.state.edit ? (
                        <input
                            type='text'
                            defaultValue={name}
                            ref={(input) => input && input.focus()}
                            onBlur={this.saveCategory.bind(this)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    this.saveAttribute()
                                }
                            }}
                            onChange={(e) => {
                                this.setState({ value: e.target.value })
                            }}
                        />
                    ) : (
                        <span>{name}</span>
                    )}
                </td>
            </tr>
        )
    }
}
