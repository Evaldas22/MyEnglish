import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { changePwd } from "../../actions/authActions";
import classnames from "classnames";
import PropTypes from 'prop-types';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import '../../css/ChangePwd.css';
import * as types from '../../actions/types';

class ChangePwd extends Component {

  constructor() {
    super();
    this.state = {
      name: "",
      password: "",
      password2: "",
      errors: {}
    };

    // use this ref to click on button after successfully changed password.
    // this is the only way to trigger notification system to show up
    this.successButton = React.createRef();
  }

  createNotification = (type) => {
    return () => {
      switch (type) {
        case 'success':
          NotificationManager.success('Your password has been successfully changed!', 'Success', 5000);
          break;

        default:
          break;  
      }
    };
  };

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push("/login");
    }

    this.setState({ name: this.props.auth.user.name });
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const updatedTeacher = {
      name: this.state.name,
      password: this.state.password,
      password2: this.state.password2
    };

    this.props.changePwd(updatedTeacher)
      .then((res) => {
        this.setState({
          password: "",
          password2: ""
        });

        console.log(res);
        if (res.type !== types.GET_ERRORS) {
          this.successButton.current.click();
        }
      })
  };

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <Link to="/dashboard" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Change password</b> below
              </h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.name}
                  error={errors.name}
                  id="name"
                  type="hidden"
                  className={classnames("", { invalid: errors.name })}
                />
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  className={classnames("", { invalid: errors.password })}
                />
                <label htmlFor="password">Password</label>
                <span className="red-text">{errors.password}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password2}
                  error={errors.password2}
                  id="password2"
                  type="password"
                  className={classnames("", { invalid: errors.password2 })}
                />
                <label htmlFor="password2">Confirm Password</label>
                <span className="red-text">{errors.password2}</span>
              </div>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  type="submit"
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Submit
                </button>
              </div>
            </form>
            <button ref={this.successButton} className='hidden-button' onClick={this.createNotification('success')}></button>
          </div>
        </div>
        <NotificationContainer />
      </div>
    );
  }
}

ChangePwd.propTypes = {
  changePwd: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, { changePwd })(withRouter(ChangePwd));