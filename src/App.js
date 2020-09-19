import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { HelmetProvider } from 'react-helmet-async'

/* Custom Components */
import NavBar from './components/navbar/navbar'

/* Page Components */
import HomePage from './components/home/home'
import VideosPage from './components/videos/videos'
import VideoPage from './components/video/video'
import StarPage from './components/star/star'
import VideoSearchPage from './components/search/videosearch'
import StarSearchPage from './components/search/starsearch'
import { AttributesPage, CategoriesPage } from './components/editor/editor'

import ErrorPage from './components/404/404'

/* Style */
import './components/styles/main.scss'

class App extends Component {
    render() {
        return (
            <HelmetProvider>
                <Router>
                    <NavBar />

                    <main className='container-fluid'>
                        <div className='row'>
                            <Switch>
                                <Route path='/videos/add'>
                                    <p>Add Videos Page</p>
                                </Route>

                                <Route path='/videos/search' component={VideoSearchPage} />
                                <Route path='/videos' component={VideosPage} />
                                <Route path='/video/:id' component={VideoPage} />

                                <Route path='/stars/search' component={StarSearchPage} />
                                <Route path='/star/:id' component={StarPage} />

                                <Route path='/settings'>
                                    <h2>Settings Page</h2>
                                </Route>

                                <Route path='/editor/attribute' component={AttributesPage} />
                                <Route path='/editor/category' component={CategoriesPage} />

                                <Route path='/generate/thumbnails'>
                                    <h2>Generate Thumbnails Page</h2>
                                </Route>

                                <Route path='/generate/vtt'>
                                    <h2>VTT Page</h2>
                                </Route>

                                <Route path='/franchise'>
                                    <h2>Franchise Page</h2>
                                </Route>

                                <Route path='/' exact component={HomePage} />

                                <Route path='*' component={ErrorPage} />
                            </Switch>
                        </div>
                    </main>
                </Router>
            </HelmetProvider>
        )
    }
}

export default App
