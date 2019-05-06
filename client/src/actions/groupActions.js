import axios from "axios";

import * as types from "./types";

// Get data about all teacher groups
export const getGroups = teacherId => dispatch => {
  axios
    .get(`/api/groups/?teacherId=${teacherId}`)
    .then(res => {
      dispatch({
        type: types.GET_GROUPS_OK,
        payload: res.data
      })
    }) 
    .catch(err =>
      dispatch({
        type: types.GET_ERRORS,
        payload: err.response.data
      })
    );
};