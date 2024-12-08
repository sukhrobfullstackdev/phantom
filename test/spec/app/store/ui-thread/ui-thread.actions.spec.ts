import { setUIThreadPayload, setUIThreadError, setUIThreadResponse } from '~/app/store/ui-thread/ui-thread.actions';

test('setUIThreadPayload', async () => {
  const action = setUIThreadPayload({} as any);
  expect(action).toEqual({ type: 'uiThread/SET_UI_THREAD_PAYLOAD', payload: {} as any });
});

test('setUIThreadError', async () => {
  const action = setUIThreadError({} as any);
  expect(action).toEqual({ type: 'uiThread/SET_UI_THREAD_ERROR', payload: {} as any });
});

test('setUIThreadResponse', async () => {
  const action = setUIThreadResponse({} as any);
  expect(action).toEqual({ type: 'uiThread/SET_UI_THREAD_RESPONSE', payload: {} as any });
});
