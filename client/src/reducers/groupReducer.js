import * as types from "../actions/types";

const initialState = [];

export default function(state = initialState, action) {
  switch (action.type) {
    case types.GET_GROUPS_OK:
      return action.payload;

    default:
      return state;
  }
}