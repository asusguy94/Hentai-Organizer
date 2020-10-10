import React, { Component } from 'react'

import Axios from 'axios'

import './editor.scss'

import config from '../config.json'

export default class EditorPage extends Component {
    render() {
        return (
            <div id='editor-page' className='col-12 row'>
                <AttributesPage className='col-4' />
                <CategoriesPage className='col-4' />
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
                    <h2 className='col-5'>Attributes Page</h2>

                    <div className='col-7 mt-1'>
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

    setCondition(ref, prop, value, checkbox) {
        Axios.get(`${config.api}/setattributelimit.php?attributeID=${ref.id}&prop=${prop}&value=${value}`)
            .then(({ data }) => {
                if (!data.success) error()
            })
            .catch(() => {
                error()
            })

        const error = () => (checkbox.checked = !checkbox.checked)
    }

    sortID(obj = null) {
        this.setState((prevState) => {
            let attributes = obj || prevState.attributes
            attributes.sort(({ id: valA }, { id: valB }) => valA - valB)

            return attributes
        })
    }
    sortName(obj = null) {
        this.setState((prevState) => {
            let attributes = obj || prevState.attributes
            attributes.sort(({ name: valA }, { name: valB }) => valA.localeCompare(valB))

            return attributes
        })
    }

    toggleSort(column) {
        switch (column) {
            case 'id':
                this.sortID()
                break
            case 'name':
                this.sortName()
                break
            default:
                console.log(`${column} is not sortable`)
        }
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
                        <Attribute
                            key={i}
                            data={attribute}
                            updateAttribute={(ref, value) => this.updateAttribute(ref, value)}
                            setCondition={(ref, prop, value, element) => this.setCondition(ref, prop, value, element)}
                        />
                    ))}
                </tbody>
            </table>
        )
    }

    getData() {
        Axios.get(`${config.api}/attributes.php`).then(({ data: attributes }) => {
            this.sortID(attributes)
            this.setState({ attributes })
        })
    }
}

class Attribute extends Component {
    constructor(props) {
        super(props)
        this.state = { edit: false, value: null, conditions: { videoOnly: props.data.videoOnly, starOnly: props.data.starOnly } }
    }

    saveAttribute() {
        this.setState({ edit: false })

        if (this.state.value) {
            this.props.updateAttribute(this.props.data, this.state.value)
        }
    }

    handleConditionChange(e, attribute, prop) {
        const value = Number(e.target.checked)

        this.props.setCondition(attribute, prop, value, e.target)
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
                    <input
                        type='checkbox'
                        defaultChecked={starOnly}
                        onChange={(e) => this.handleConditionChange(e, attribute, 'starOnly')}
                    />
                </td>

                <td>
                    <input
                        type='checkbox'
                        defaultChecked={videoOnly}
                        onChange={(e) => this.handleConditionChange(e, attribute, 'videoOnly')}
                    />
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
                    <h2 className='col-5'>Categories Page</h2>

                    <div className='col-7 mt-1'>
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

    sortID() {
        this.setState((prevState) => {
            let { categories } = prevState
            categories.sort(({ id: valA }, { id: valB }) => valA - valB)

            return categories
        })
    }
    sortName() {
        this.setState((prevState) => {
            let { categories } = prevState
            categories.sort(({ name: valA }, { name: valB }) => valA.localeCompare(valB))

            return categories
        })
    }

    toggleSort(column) {
        switch (column) {
            case 'id':
                this.sortID()
                break
            case 'name':
                this.sortName()
                break
            default:
                console.log(`${column} is not sortable`)
        }
    }

    render() {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th className='sortable' onClick={() => this.toggleSort('id')}>
                            ID
                        </th>
                        <th className='sortable' onClick={() => this.toggleSort('name')}>
                            Category
                        </th>
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
            this.setState({ categories })
            this.toggleSort('id')
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
