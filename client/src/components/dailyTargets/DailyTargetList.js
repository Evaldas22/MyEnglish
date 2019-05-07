import React, { Component } from 'react';
import { ListGroup } from 'reactstrap';
import Proptypes from 'prop-types';
import _ from "lodash";
import DailyTargetItem from "./DailyTargetItem";

class DailyTargetList extends Component {
  render() {
    const { dailyTargets } = this.props;

    return (
      <ListGroup>
        {
          !_.isEmpty(dailyTargets) ?
            dailyTargets.map((dailyTarget, index) => <DailyTargetItem key={index} dailyTarget={dailyTarget} />) : null
        }
      </ListGroup>
    )
  }
}

DailyTargetList.propTypes = {
  dailyTargets: Proptypes.array.isRequired
}

export default DailyTargetList;