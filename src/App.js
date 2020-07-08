import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

/* Custom Components */
import NavBar from './components/navbar'

/* Page Components */
import HomePage from './components/pages/home'
import VideosPage from './components/pages/videos'
import RandomVideoPage from './components/pages/randomvideo'
import VideoPage from './components/pages/video'

/* Style */
import './components/styles/main.scss'

// TODO Rewrite scss files, currently rules might overwrite another
// TODO Loader is not rendering

class App extends Component {
    render() {
        return (
            <Router>
                <NavBar />

                <main className='container-fluid'>
                    <div className='row'>
                        <Switch>
                            <Route path='/videos/search'>
                                <h1>Video Search Page</h1>
                            </Route>

                            <Route path='/videos/add'>
                                <p>Add Videos Page</p>
                            </Route>

                            <Route path='/videos/random' component={RandomVideoPage} />

                            <Route path='/videos' component={VideosPage} />

                            <Route path='/video/:id' component={VideoPage} />

                            <Route path='/stars/search'>
                                <p>Stars Search Page</p>
                            </Route>

                            <Route path='/generate/thumbnails'>
                                <p>Generate Thumbnails Page</p>
                            </Route>

                            <Route path='/generate/vtt'>
                                <p>VTT Page</p>
                            </Route>

                            <Route path='/franchise'>
                                <p>Franchise Page</p>
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
