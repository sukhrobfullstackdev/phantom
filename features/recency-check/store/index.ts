import { createStore } from '~/app/store';
import { RecencyReducer } from './recency.reducer';

export const recencyStore = createStore(RecencyReducer, 'recency');
