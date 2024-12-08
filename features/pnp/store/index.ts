import { createStore } from '~/app/store';
import { PNPReducer } from './pnp.reducer';

export const pnpStore = createStore(PNPReducer, 'pnp');
