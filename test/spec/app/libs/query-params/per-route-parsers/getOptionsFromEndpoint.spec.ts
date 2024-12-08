import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';

beforeEach(() => {
  browserEnv.restore();
  sinon.restore();
});

const decodedQueryParams = { hello: 'world' };
const decodeableQueryParams = 'eyJoZWxsbyI6IndvcmxkIn0%3D';

const parsedQueryParams = { monty: 'python' };
const parseableQueryParams = 'monty=python';

test('Return options for `Endpoint.Client.SendV1` endpoint', () => {
  browserEnv.stub('window.location', {
    search: `?params=${decodeableQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.SendV1);

  expect(decodedQueryParams).toEqual(actual);
});

test('Return options for `Endpoint.Client.SendLegacy` endpoint', () => {
  browserEnv.stub('window.location', {
    search: `?params=${decodeableQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  expect(decodedQueryParams).toEqual(actual);
});

test('Return options for `Endpoint.Client.PreviewV1` endpoint', () => {
  browserEnv.stub('window.location', {
    search: `?params=${decodeableQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.PreviewV1);

  expect(decodedQueryParams).toEqual(actual);
});

test('Return options for `Endpoint.Client.ConfirmEmailV1` endpoint', () => {
  browserEnv.stub('window.location', {
    search: `?${parseableQueryParams}&ct=${decodeableQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.ConfirmEmailV1);

  expect({ ...parsedQueryParams, ct: decodedQueryParams }).toEqual(actual);
});

test('Return options for `Endpoint.Client.ConfirmV1` endpoint', () => {
  browserEnv.stub('window.location', {
    search: `?${parseableQueryParams}&ct=${decodeableQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);

  expect({ ...parsedQueryParams, ct: decodedQueryParams }).toEqual(actual);
});

test('Return options for `Endpoint.Client.ErrorV1` endpoint', () => {
  browserEnv.stub('window.location', {
    search: `?${parseableQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.ErrorV1);

  expect(parsedQueryParams).toEqual(actual);
});
