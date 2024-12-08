import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { isSdkVersionGreaterThanOrEqualTo } from '~/app/libs/is-version-greater-than';
import { Endpoint } from '~/server/routes/endpoint';

beforeEach(() => {
  browserEnv.restore();
  sinon.restore();
});

test('Return false when version 1.0.0 is LESS THAN the parameter passed in (14.0.0)', () => {
  const encodedQueryParams = 'eyJ2ZXJzaW9uIjoiMS4wLjAifQ=='; // btoa('{"version":"1.0.0"}')

  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.SendLegacy,
    search: `?params=${encodedQueryParams}`,
  });

  const isGreaterThan = isSdkVersionGreaterThanOrEqualTo('14.0.0');

  expect(isGreaterThan).toEqual(false);
});

test('Return true when version (14.0.0) is EQUAL TO the parameter passed in (14.0.0)', () => {
  const encodedQueryParams = 'eyJ2ZXJzaW9uIjoiMTQuMC4wIn0='; // btoa('{"version":"14.0.0"}')

  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.SendLegacy,
    search: `?params=${encodedQueryParams}`,
  });

  const isGreaterThanOrEqualTo = isSdkVersionGreaterThanOrEqualTo('14.0.0');

  expect(isGreaterThanOrEqualTo).toEqual(true);
});

test('Return true when version (13.0.0) is GREATER THAN the parameter passed in (12.0.0)', () => {
  const encodedQueryParams = 'eyJ2ZXJzaW9uIjoiMTMuMC4wIn0='; // btoa('{"version":"13.0.0"}')

  browserEnv.stub('window.location', {
    pathname: Endpoint.Client.SendLegacy,
    search: `?params=${encodedQueryParams}`,
  });

  const isGreaterThan = isSdkVersionGreaterThanOrEqualTo('12.0.0');

  expect(isGreaterThan).toEqual(true);
});
