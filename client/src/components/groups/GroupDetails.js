import React, { Component } from 'react';
import { connect } from "react-redux";
import { Container, Row, Col } from 'reactstrap';
import { Link } from "react-router-dom";
import Proptypes from 'prop-types';
import DailyTargetList from "../dailyTargets/DailyTargetList";

class GroupDetails extends Component {
  constructor() {
    super();
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push("/login");
    }
  }

  render() {
    const { group } = this.props.location.state;

    return (
      <Container>
        <Row>
          <Col xs="10" sm="8" md={{ size: 6, offset: 3 }}>
            <Row>
              <Col>
                <Link to="/" className="btn-flat waves-effect">
                  <i className="material-icons left">keyboard_backspace</i> Back to home
                </Link>
              </Col>
            </Row>
            <Row>
              <Col>
                <h4 style={{ display: "inline" }}>Group '{group.groupName}' details</h4>
                <Link to="/" className="btn-flat waves-effect">
                  <i className="fas fa-user-friends"></i>
                </Link>
              </Col>
            </Row>
            <Row>
              <Col>
                <Link to={{
                  pathname: '/newDailyTarget',
                  state: {
                    group: group
                  }
                }}>
                  <i className="fas fa-plus-circle fa-3x"></i>
                </Link>
              </Col>
            </Row>
            <Row>
              <Col>
                <DailyTargetList dailyTargets={group.dailyTargets} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    )
  }
}

GroupDetails.propTypes = {
  location: Proptypes.object.isRequired,
  auth: Proptypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, null)(GroupDetails);