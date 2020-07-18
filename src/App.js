import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

/* Custom Components */
import NavBar from './components/navbar'

/* Page Components */
import HomePage from './components/pages/home'
import VideosPage from './components/pages/videos'
import VideoPage from './components/pages/video'
import StarPage from './components/pages/star'
import VideoSearchPage from './components/pages/videosearch'

/* Style */
import './components/styles/main.scss'

// TODO Rewrite scss files, currently rules might overwrite another

class App extends Component {
    render() {
        return (
            <Router>
                <NavBar />

                <main className='container-fluid'>
                    <div className='row'>
                        <Switch>
                            <Route path='/videos/search' component={VideoSearchPage} />

                            <Route path='/videos/add'>
                                <p>Add Videos Page</p>
                            </Route>

                            <Route path='/videos' component={VideosPage} />

                            <Route path='/video/:id' component={VideoPage} />

                            <Route path='/stars/search'>
                                <h2>Stars Search Page</h2>
                            </Route>

                            <Route path='/stars'>
                                <h2>Stars Page</h2>
                            </Route>

                            <Route path='/star/:id' component={StarPage} />

                            <Route path='/generate/thumbnails'>
                                <h2>Generate Thumbnails Page</h2>
                            </Route>

                            <Route path='/generate/vtt'>
                                <h2>VTT Page</h2>
                            </Route>

                            <Route path='/franchise'>
                                <h2>Franchise Page</h2>
                            </Route>

                            <Route path='/' component={HomePage} />
                        </Switch>
                    </div>
                </main>
            </Router>
        )
    }
}

export default App
