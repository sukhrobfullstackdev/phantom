import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { getApiKey } from '~/app/libs/api-key';
import { getEnvironmentTypeFromQueryParams } from '~/app/libs/query-params';

beforeEach(() => {
  browserEnv.restore();
  sinon.restore();
});

test("Return 'testnet' environment if no other environment type can be parsed", () => {
  const actual = getEnvironmentTypeFromQueryParams();
  expect('testnet').toBe(actual);
});

test("Parse 'mainnet' environment from 'e' field in query param", () => {
  browserEnv.stub('window.location', {
    search: '?e=mainnet',
  });

  const actual = getEnvironmentTypeFromQueryParams();

  expect('mainnet').toBe(actual);
});

test("Parse 'testnet' environment from 'e' field in query param", () => {
  browserEnv.stub('window.location', {
    search: '?e=testnet',
  });

  const actual = getEnvironmentTypeFromQueryParams();

  expect('testnet').toBe(actual);
});

test("Parse 'mainnet' environment from API key", () => {
  const stub = sinon.stub().returns('pk_live_123');
  (getApiKey as any) = stub;

  const actual = getEnvironmentTypeFromQueryParams();

  expect('mainnet').toBe(actual);
  expect(stub.calledOnce).toBe(true);
});

test("Parse 'testnet' environment from API key", () => {
  const stub = sinon.stub().returns('pk_test_123');
  (getApiKey as any) = stub;

  const actual = getEnvironmentTypeFromQueryParams();

  expect('testnet').toBe(actual);
  expect(stub.calledOnce).toBe(true);
});
