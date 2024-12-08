import { createStore } from '~/app/store';
import { nativeMethodsReducer } from './native-methods.reducer';

export const nativeMethodsStore = createStore(nativeMethodsReducer, 'native methods');
