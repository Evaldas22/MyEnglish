import React, {Component} from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import './App.css';

import NavBar from "./components/common/NavBar";
import Landing from "./components/common/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import { Provider } from "react-redux";
import store from "./store";

class App extends Component {
  render(){
    return (
      <Provider store={store}>
        <BrowserRouter>
          <div className="App">
            <NavBar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
          </div>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
