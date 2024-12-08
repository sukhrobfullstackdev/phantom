import browserEnv from '@ikscodes/browser-env';
import { getApiKey } from '~/app/libs/api-key';
import { Endpoint } from '~/server/routes/endpoint';

beforeEach(() => {
  browserEnv.restore();
});

test('Return API key for `Endpoint.Client.ConfirmV1` endpoint', () => {
  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.ConfirmV1,
    search: '?ak=pk_test_123',
  });

  const actual = getApiKey();

  expect('pk_test_123').toBe(actual);
});

test('Return API key for `Endpoint.Client.SendV1` endpoint', () => {
  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.SendV1,
    search: '?params=eyJBUElfS0VZIjoicGtfdGVzdF8xMjMifQ%3D%3D',
  });

  const actual = getApiKey();

  expect('pk_test_123').toBe(actual);
});

test('Return API key for `Endpoint.Client.SendLegacy` endpoint', () => {
  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.SendLegacy,
    search: '?params=eyJBUElfS0VZIjoicGtfdGVzdF8xMjMifQ%3D%3D',
  });

  const actual = getApiKey();

  expect('pk_test_123').toBe(actual);
});
