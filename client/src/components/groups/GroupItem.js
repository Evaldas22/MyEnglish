import React from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem } from 'reactstrap';

const GroupItem = ({ groupName }) => (
  <ListGroupItem>{groupName}</ListGroupItem>
)

GroupItem.propTypes = {
  groupName: PropTypes.string.isRequired
}

export default GroupItem;