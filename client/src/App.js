import React, {Component} from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import './App.css';

import NavBar from "./components/common/NavBar";
import Landing from "./components/common/Landing";
import Login from "./components/auth/Login";
import ChangePwd from "./components/auth/ChangePwd";
import Register from "./components/auth/Register";
import PrivateRoute from "./components/privateRoutes/PrivateRoute";
import AdminRoute from "./components/privateRoutes/AdminRoute";
import Dashboard from "./components/dashboard/Dashboard";
import NewGroup from "./components/groups/NewGroup";
import GroupDetails from "./components/groups/GroupDetails";
import NewDailyTarget from "./components/dailyTargets/NewDailyTarget";

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
// Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./login";
  }
}

class App extends Component {
  render(){
    return (
      <Provider store={store}>
        <BrowserRouter>
          <div className="App">
            <NavBar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/login" component={Login} />
            <Switch>
              <AdminRoute exact path="/register" component={Register} />
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path="/changePwd" component={ChangePwd} />
              <PrivateRoute exact path="/createNewGroup" component={NewGroup} />
              <PrivateRoute exact path="/groupDetails" component={GroupDetails} />
              <PrivateRoute exact path="/newDailyTarget" component={NewDailyTarget} />
            </Switch>
          </div>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
