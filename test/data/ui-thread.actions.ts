export const acquireLockAndShowUIActions = [
  { type: 'system/SET_SHOW_UI', payload: true },
  { type: 'uiThread/SET_UI_THREAD_PAYLOAD', payload: { method: 'a' } },
  { type: 'uiThread/SET_UI_THREAD_ERROR' },
  { type: 'uiThread/SET_UI_THREAD_RENDER_FN', payload: 'fake_react_component' },
];

export const releaseLockAndHideUIActions = [
  { type: 'uiThread/SET_UI_THREAD_PAYLOAD' },
  { type: 'activePayload/RESET_ACTIVE_PAYLOAD' },
  { payload: false, type: 'system/SET_SHOW_UI' },
  { type: 'uiThread/SET_UI_THREAD_RENDER_FN' },
  { type: 'uiThread/SET_UI_THREAD_RESPONSE', response: undefined },
];
