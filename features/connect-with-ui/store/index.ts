import { createStore } from '~/app/store';
import { ConnectReducer } from './connect.reducer';

export const connectStore = createStore(ConnectReducer, 'connect');
