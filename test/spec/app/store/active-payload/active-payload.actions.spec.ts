import { JsonRpcRequestPayload } from 'fortmatic';
import { setActivePayload, resetActivePayload } from '~/app/store/active-payload/active-payload.actions';

test('setActivePayload', async () => {
  const payload: Partial<JsonRpcRequestPayload> = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_sendTransaction',
  };
  const action = setActivePayload(payload);
  expect(action).toEqual({ type: 'activePayload/SET_ACTIVE_PAYLOAD', payload });
});

test('resetActivePayload', async () => {
  const payload: Partial<JsonRpcRequestPayload> = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_sendTransaction',
  };
  setActivePayload(payload);

  const action = resetActivePayload();
  expect(action).toEqual({ type: 'activePayload/RESET_ACTIVE_PAYLOAD' });
});
