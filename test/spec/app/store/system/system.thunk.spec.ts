import sinon from 'sinon';
import { JsonRpcRequestPayload, JsonRpcResponsePayload } from 'magic-sdk';
import { mockCoreStore } from '../../../_utils/mockStore';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { MessageChannelService } from '~/app/services/message-channel';
import { getPayloadEventEmitter } from '~/app/rpc/utils';
import { createSDKError } from '~/app/libs/exceptions';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';

const mockPayload: JsonRpcRequestPayload = {
  jsonrpc: '2.0',
  id: '1',
  method: 'test-method',
};

const mockResult = {
  jsonrpc: '2.0',
  id: '1',
  result: 'test-result',
  error: undefined,
};

test('#1 Dispatch a payload response event to the SDK', async () => {
  const store = mockCoreStore({});

  const stub = sinon.stub(MessageChannelService.rpc, 'post');

  await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload: mockPayload, result: 'test-result' }));

  expect(stub.args[0][0]).toEqual('MAGIC_HANDLE_RESPONSE');
  expect(stub.args[0][1]).toEqual(mockResult);

  stub.restore();
});

const mockSDKError = createSDKError(-32603, 'Internal error');

const mockSDKErrorResult = {
  jsonrpc: '2.0',
  id: '1',
  result: undefined,
  error: mockSDKError.jsonRpcError,
};

test('#2 Dispatch an SDKError error event to the SDK', async () => {
  const store = mockCoreStore({});

  const stub = sinon.stub(MessageChannelService.rpc, 'post');
  await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload: mockPayload, error: mockSDKError }));

  expect(stub.args[0][0]).toEqual('MAGIC_HANDLE_RESPONSE');
  expect(stub.args[0][1]).toEqual(mockSDKErrorResult);
  stub.restore();
});

const mockJsonRpcError = {
  code: -32603,
  message: 'Internal error',
  data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011555345525f554e52454749535445524544000000000000000000000000000000',
};

const mockJsonRpcErrorResponse: JsonRpcResponsePayload = {
  jsonrpc: '2.0',
  id: '1',
  result: undefined,
  error: mockJsonRpcError,
};

test('#3 Dispatch a JsonRpcError error event to the SDK', async () => {
  const store = mockCoreStore({});

  const stub = sinon.stub(MessageChannelService.rpc, 'post');

  await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload: mockPayload, error: mockJsonRpcError }));

  expect(stub.args[0][0]).toEqual('MAGIC_HANDLE_RESPONSE');
  expect(stub.args[0][1]).toEqual(mockJsonRpcErrorResponse);

  stub.restore();
});

test('#4 Verify getPayloadEventEmitter called', async () => {
  const stub = sinon.stub(getPayloadEventEmitter(mockPayload));
  const res = stub.emit('done');

  expect(res).toEqual(undefined);
});

const emitJsonRpcEventResponse = {
  jsonrpc: '2.0',
  id: '1',
  result: { event: 'test-event', params: [] },
};

test('#5 Emit a payload response event to the SDK', async () => {
  const store = mockCoreStore({});

  const stub = sinon.stub(MessageChannelService.rpc, 'post');

  await store.dispatch(SystemThunks.emitJsonRpcEvent({ payload: mockPayload, event: 'test-event' }));

  expect(stub.args[0][0]).toEqual('MAGIC_HANDLE_EVENT');
  expect(stub.args[0][1]).toEqual(emitJsonRpcEventResponse);

  stub.restore();
});

test('#6 Remove event listeners after RPC Intermediary Event', async () => {
  const store = mockCoreStore({});
  const handle = jest.fn();
  const mockArgs = {};

  RpcIntermediaryEventService.on('verify-email-otp', mockPayload, handle);
  RpcIntermediaryEventService.emit('verify-email-otp', mockPayload.id, mockArgs);

  expect(handle).toHaveBeenCalledTimes(1);
  expect(handle.mock.calls[0][0]).toBe(mockArgs);
  // Remove event
  await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload: mockPayload }));
  RpcIntermediaryEventService.emit('verify-email-otp', mockPayload.id, mockArgs);
  expect(handle).toHaveBeenCalledTimes(1);
});
