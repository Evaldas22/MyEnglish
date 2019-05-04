import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from './reducers';

const middleware = [thunk];

if (process.env.NODE_ENV !== 'production') {
  const logger = require('redux-logger');
  middleware = [...middleware, logger];
}

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);
export default store;