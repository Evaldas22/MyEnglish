import React from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';

const GroupItem = ({ group }) => (
  <ListGroupItem>
    <Link to={{
      pathname: '/groupDetails',
      state: {
        group: group
      }
    }}>{group.groupName}</Link>
  </ListGroupItem>
)

GroupItem.propTypes = {
  group: PropTypes.object.isRequired
}

export default GroupItem;