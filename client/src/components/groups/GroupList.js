import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import GroupItem from './GroupItem';
import { ListGroup } from 'reactstrap';

class GroupList extends Component {
  render(){
    return (
    <ListGroup>
      {
        !_.isEmpty(this.props.groups) ? 
          this.props.groups.map((group, index) => <GroupItem key={index} group={group}/>) : null
      }
    </ListGroup>
    )
  }
}

GroupList.propTypes = {
  groups: PropTypes.array.isRequired
};

export default GroupList; 