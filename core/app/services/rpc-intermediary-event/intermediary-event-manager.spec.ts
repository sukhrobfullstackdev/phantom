import { RpcIntermediaryEventService } from './index';

const eventNameA = 'email-otp-sent';
const payloadA = {
  jsonrpc: 'jsonrpc',
  id: 5,
  method: 'method',
};
const eventArgsA = {
  jackIsAFat: 'cat',
};

const eventNameB = 'verify-email-otp';
const payloadB = {
  jsonrpc: 'jsonrpc',
  id: '3',
  method: 'method',
};
const eventArgsB = {
  jillIsAFat: 'dog',
};

const nullPayload = {
  jsonrpc: 'jsonrpc',
  id: null,
  method: 'method',
};

test('when a payload with a number type id is added then it should fire', async () => {
  const handle = jest.fn();
  RpcIntermediaryEventService.on(eventNameA, payloadA, handle);
  // emit event
  RpcIntermediaryEventService.emit(eventNameA, payloadA.id, eventArgsA);

  // expect on event to be fired with args
  expect(handle).toHaveBeenCalledTimes(1);
  expect(handle.mock.calls[0][0]).toBe(eventArgsA);
});

test('when a payload with a string type id is added then it should fire', async () => {
  const handle = jest.fn();
  RpcIntermediaryEventService.on(eventNameB, payloadB, handle);
  // emit event
  RpcIntermediaryEventService.emit(eventNameB, payloadB.id, eventArgsB);

  // expect on event to be fired with args
  expect(handle).toHaveBeenCalledTimes(1);
  expect(handle.mock.calls[0][0]).toBe(eventArgsB);
});

test('when a payload is removed then all event listeners are removed', async () => {
  const handle = jest.fn();

  // on event
  RpcIntermediaryEventService.on(eventNameA, payloadA, handle);
  // clear event
  RpcIntermediaryEventService.remove(payloadA);
  // emit event
  RpcIntermediaryEventService.emit(eventNameA, payloadA.id, eventArgsA);
  // expect on event to be fired with args
  expect(handle).toHaveBeenCalledTimes(0);
});

test('when a payload is added, removed, and then readded, it should fire once', async () => {
  const handle = jest.fn();

  // on event
  RpcIntermediaryEventService.on(eventNameA, payloadA, handle);
  // clear event
  RpcIntermediaryEventService.remove(payloadA);
  // on event
  RpcIntermediaryEventService.on(eventNameA, payloadA, handle);
  // emit event
  RpcIntermediaryEventService.emit(eventNameA, payloadA.id, eventArgsA);
  // expect on event to be fired with args
  expect(handle).toHaveBeenCalledTimes(1);
  expect(handle.mock.calls[0][0]).toBe(eventArgsA);
});

test('when a payload A is added, then payload B is added, then payload A is removed, payload B should return', async () => {
  const handleA = jest.fn();
  const handleB = jest.fn();

  // on event A
  RpcIntermediaryEventService.on(eventNameA, payloadA, handleA);
  // on event B
  RpcIntermediaryEventService.on(eventNameB, payloadB, handleB);
  // clear event A
  RpcIntermediaryEventService.remove(payloadA);
  // emit event A
  RpcIntermediaryEventService.emit(eventNameA, payloadA.id, eventArgsA);
  // emit event B
  RpcIntermediaryEventService.emit(eventNameB, payloadB.id, eventArgsB);
  // expect on event to be fired with eventArgsB
  expect(handleB.mock.calls[0][0]).toBe(eventArgsB);
  expect(handleA).toHaveBeenCalledTimes(0);
});

test('when a payload A is null, then event bus should be empty', async () => {
  const handle = jest.fn();

  // on event A
  RpcIntermediaryEventService.on(eventNameA, nullPayload, handle);
  // emit event A
  RpcIntermediaryEventService.emit(eventNameA, nullPayload.id, eventArgsA);

  // expect on event to be fired with null
  expect(handle.mock.calls[0]).toBe(undefined);
  expect(handle).toHaveBeenCalledTimes(0);
});

test('when a payload A is null, then event bus should be empty', async () => {
  const handle = jest.fn();

  // on event A
  RpcIntermediaryEventService.on(eventNameA, nullPayload, handle);
  // on event B
  RpcIntermediaryEventService.on(eventNameB, payloadB, handle);
  // clear event A
  RpcIntermediaryEventService.remove(nullPayload);
  // emit event A
  RpcIntermediaryEventService.emit(eventNameA, payloadB.id, eventArgsA);

  // expect on event to be fired with null
  expect(handle.mock.calls[0]).toBe(undefined);
  expect(handle).toHaveBeenCalledTimes(0);
});
