import { createStore } from './redux-store';
import { getRootReducer } from './root-reducer';

export const store = createStore(getRootReducer, 'root store');

export { RootState } from './root-reducer';
export { createStore } from './redux-store';
