import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logoutUser } from '../../actions/authActions';
import '../../css/styles.css';

class NavBar extends Component {

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-light">
          <ul className="navbar-nav mr-auto">
            <li>
              <Link to='/dashboard' className="home nav-link col s5 brand-logo white-text navItem"
                style={{ fontFamily: "monospace" }}>
                <i className="material-icons">home</i>Home
              </Link>
            </li>
            {
              this.props.auth.isAuthenticated && this.props.auth.user.role === "admin" ?
                <li>
                  <a href='/register' className="nav-item navItem">New teacher</a>
                </li> : null
            }
            {
              this.props.auth.isAuthenticated ?
                <li>
                  <a href='/changePwd' className="nav-item navItem">Change password</a>
                </li> : null
            }
            {
              this.props.auth.isAuthenticated ?
                <li>
                  <a onClick={this.onLogoutClick} className="nav-item navItem">Logout</a>
                </li> : null
            }
          </ul>
        </nav>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(mapStateToProps, { logoutUser })(NavBar);