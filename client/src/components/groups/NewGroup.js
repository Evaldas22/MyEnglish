import React, { Component } from 'react';
import { connect } from "react-redux";
import { Container, Row, Col } from 'reactstrap';
import classnames from "classnames";
import { Link } from "react-router-dom";

class NewGroup extends Component {
  constructor() {
    super();
    this.state = {
      groupName: "",
      teacherId: "",
      errors: {}
    };
  }

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push("/login");
    }

    this.setState({ teacherId: this.props.auth.user.id });
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

    const newGroup = {
      groupName: this.state.groupName,
      teacherId: this.state.teacherId
    };

    // this.props.registerUser(newGroup, this.props.history);
  };

  render() {
    const { errors } = this.state;

    return (
      <Container>
        <Row>
          <div className="col s8 offset-s2">
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Create new group</b>
              </h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.groupName}
                  error={errors.groupName}
                  id="groupName"
                  type="text"
                  className={classnames("", { invalid: errors.groupName })}
                />
                <label htmlFor="groupName">Group name</label>
                <span className="red-text">{errors.groupName}</span>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </Row>
      </Container>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, {})(NewGroup);