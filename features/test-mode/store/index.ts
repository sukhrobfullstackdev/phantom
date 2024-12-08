import { createStore } from '~/app/store';
import { TestMode } from './test-mode.reducer';

export const testModeStore = createStore(TestMode, 'test mode');
