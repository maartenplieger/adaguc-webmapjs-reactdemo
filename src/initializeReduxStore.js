import { createStore } from 'redux';
import { createReducerManager } from './ReducerManager';

const reducerManager = createReducerManager({});

/* Create a store with the root reducer function being the one exposed by the manager. */
const store = createStore(reducerManager.reduce, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

/* Optional: Put the reducer manager on the store so it is easily accessible */
store.reducerManager = reducerManager;
window.reducerManager = reducerManager;

console.log('Store created');
export default store;
