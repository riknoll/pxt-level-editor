import { createStore } from 'redux';

import reducer from './reducer';

const initialState = {};
const store = createStore(reducer);
export default store;