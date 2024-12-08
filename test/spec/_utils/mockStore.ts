import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { store } from '~/app/store';

const middlewares = [thunk];

export const mockFeatureStore = configureStore<any, any>(middlewares);

export const mockCoreStore = initialState => {
  (store as any) = configureStore<any, any>(middlewares)(initialState);
  return (store as unknown) as MockStoreEnhanced<any, any>;
};

export const restoreMockCoreStore = () => {
  (store as any) = coreStore;
};

const coreStore = store;
