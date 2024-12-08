import { createStore } from '~/app/store';
import { RevealReducer } from './reveal.reducer';

export const revealStore = createStore(RevealReducer, 'reveal');
