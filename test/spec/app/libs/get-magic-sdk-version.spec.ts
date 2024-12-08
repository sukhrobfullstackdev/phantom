import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';

beforeEach(() => {
  browserEnv.restore();
  sinon.restore();
});

test('Return version for `Endpoint.Client.SendV1.version` endpoint', () => {
  const encodedQueryParams = 'eyJ2ZXJzaW9uIjoiMS4wLjAifQ=='; // btoa('{"version":"1.0.0"}')

  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.SendV1,
    search: `?params=${encodedQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.SendV1).version;

  expect('1.0.0').toEqual(actual);
});

test('Return version for `Endpoint.Client.SendLegacy.version` endpoint', () => {
  const encodedQueryParams = 'eyJ2ZXJzaW9uIjoiMS4wLjAifQ=='; // btoa('{"version":"1.0.0"}')

  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.SendLegacy,
    search: `?params=${encodedQueryParams}`,
  });

  const actual: any = getOptionsFromEndpoint(Endpoint.Client.SendLegacy).version;

  expect('1.0.0').toEqual(actual);
});
