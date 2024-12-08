import { createStore } from '~/app/store';
import { Mfa } from './mfa.reducer';

export const mfaStore = createStore(Mfa, 'mfa');
