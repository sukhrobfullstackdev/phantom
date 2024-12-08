import { createStore } from '~/app/store';
import { Recovery } from './recovery.reducer';

export const recoveryStore = createStore(Recovery, 'recovery');
