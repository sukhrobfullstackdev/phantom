import { ActionType, createReducer } from 'typesafe-actions';
import { createPersistReducer } from '~/app/store/persistence';
import * as testModeActions from './test-mode.actions';

interface TestModeState {
  userEmail?: string;
  isLoggedIn?: boolean;
  publicAddress?: string;
  privateAddress?: string;
}

type TestModeActions = ActionType<typeof testModeActions>;

const initialState: TestModeState = {
  userEmail: undefined,
  isLoggedIn: false,
  publicAddress: undefined,
  privateAddress: undefined,
};

const TestModeReducerImpl = createReducer<TestModeState, TestModeActions>(initialState)
  .handleAction(testModeActions.setTestModeUserEmail, (state, action) => ({ ...state, userEmail: action.payload }))
  .handleAction(testModeActions.setTestModeUserKeys, (state, action) => ({ ...state, ...action.payload }))
  .handleAction(testModeActions.setTestModeLoginStatus, (state, action) => ({ ...state, isLoggedIn: action.payload }))
  .handleAction(testModeActions.testModeLogout, () => ({ ...initialState }));

export const TestMode = createPersistReducer('testMode', TestModeReducerImpl, {
  whitelist: ['userEmail', 'isLoggedIn', 'publicAddress', 'privateAddress'],
});
