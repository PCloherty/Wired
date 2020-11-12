import React from 'react';
import './App.css';
import {BrowserRouter as Router,Route, Switch} from 'react-router-dom'
import Navbar from './components/layout/Navbar.js';
import Landing from './components/layout/Landing.js';
import Login from './components/auth/login.js';
import Register from './components/auth/register.js';
function App() {
    return (
        <Router>

            <Navbar></Navbar>
            <Route exact path="/" component={Landing}></Route>
            <section className="container">
              <Switch>
              <Route exact path="/register" component={Register}/>
              <Route exact path="/login" component={Login} />
              </Switch>
            </section>
        </Router>
    );
}

export default App;
