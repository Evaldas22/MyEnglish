import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { getGroups } from "../../actions/groupActions";
import GroupList from "../groups/GroupList";
import { Container, Row, Col } from 'reactstrap';
import { Link } from "react-router-dom";

class Dashboard extends Component {

  componentDidMount = () => {
    this.props.getGroups(this.props.auth.user.id);
  }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    return (
      <Container>
        <Row>
          <Col xs="10" sm="8" md={{ size: 6, offset: 3 }}>
            <Row>
              <Col>
                <h4><b>Hey </b> {this.props.auth.user.name}</h4>
              </Col>
            </Row>
            <Row>
              <Col>
                <Link to='/createNewGroup'>
                  <i className="fas fa-plus-circle fa-3x"></i>
                </Link>
              </Col>
            </Row>
            <Row>
              <Col>
                <GroupList groups={this.props.groups} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  groups: PropTypes.array
};

const mapStateToProps = state => ({
  auth: state.auth,
  groups: state.groups
});

export default connect(mapStateToProps, { logoutUser, getGroups })(Dashboard);