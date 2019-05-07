import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem } from 'reactstrap';
import moment from 'moment';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import _ from "lodash";

class DailyTargetItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    const { dailyTarget } = this.props;

    return (
      <ListGroupItem style={{ border: "none" }}>
        <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret>
          {moment(dailyTarget.date).format('YYYY-MM-DD')}
          </DropdownToggle>
          {
            !_.isEmpty(dailyTarget.listOfTargets) ? 
            <DropdownMenu>
              {dailyTarget.listOfTargets.map((target, index) => <DropdownItem key={index} disabled>{target}</DropdownItem>)}
            </DropdownMenu> 
            : null
          }
        </ButtonDropdown>
      </ListGroupItem>
    )
  }
}

DailyTargetItem.propTypes = {
  dailyTarget: PropTypes.object.isRequired
}

export default DailyTargetItem;