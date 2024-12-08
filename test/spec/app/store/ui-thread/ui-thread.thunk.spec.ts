import browserEnv from '@ikscodes/browser-env';
import { acquireLockAndShowUIActions, releaseLockAndHideUIActions } from '~/test/data/ui-thread.actions';
import { mockCoreStore } from '../../../_utils/mockStore';
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';

test('#1 acquireLockAndShowUI successfully', async () => {
  browserEnv.stub('window.localStorage', {});

  const store = mockCoreStore({ UIThread: { payload: { method: 'b' } } });

  await store.dispatch(UIThreadThunks.acquireLockAndShowUI({ method: 'a' } as any, 'fake_react_component' as any));

  const actions = store.getActions();
  expect(actions).toEqual(acquireLockAndShowUIActions);
});

test('#2 acquireLockAndShowUI duplicatePayload no actions called', async () => {
  browserEnv.stub('window.localStorage', {});

  const store = mockCoreStore({ UIThread: { payload: { method: 'a' } } });

  await store.dispatch(UIThreadThunks.acquireLockAndShowUI({ method: 'a' } as any), 'fake_react_component' as any);

  const actions = store.getActions();
  expect(actions).toEqual([]);
});

test('#1 releaseLockAndHideUI successfully', async () => {
  browserEnv.stub('window.localStorage', { pathname: '/send' });

  const store = mockCoreStore({ UIThread: { payload: {} } });

  await store.dispatch(UIThreadThunks.releaseLockAndHideUI({} as any));

  const actions = store.getActions();
  expect(actions).toEqual(releaseLockAndHideUIActions);
});
