import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import classnames from "classnames";
import PropTypes from 'prop-types';
import { createNewDailyTarget } from '../../actions/groupActions';

class NewDailyTarget extends Component {

  constructor() {
    super();
    this.state = {
      id: "",
      groupName: "",
      dailyTargets: "",
      errors: {}
    };
  }

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push("/login");
    }

    this.setState({
      id: this.props.location.state.group._id,
      groupName: this.props.location.state.group.groupName
    });
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

    const newDailyTarget = {
      id: this.state.id,
      groupName: this.state.groupName,
      dailyTargets: this.state.dailyTargets
    };

    this.props.createNewDailyTarget(newDailyTarget, this.props.history)
  };

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <Link to={{
              pathname: '/groupDetails',
              state: {
                group: this.props.location.state.group
              }
            }} className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>New daily target</h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.dailyTargets}
                  error={errors.group}
                  id="dailyTargets"
                  type="text"
                  className={classnames("", { invalid: errors.group })}
                />
                <label htmlFor="dailyTargets">Please enter comma separated daily targets</label>
                <span className="red-text">{errors.group}</span>
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
          </div>
        </div>
      </div>
    );
  }
}

NewDailyTarget.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, { createNewDailyTarget })(NewDailyTarget);