import browserEnv from '@ikscodes/browser-env';
import { currentEndpoint } from '~/app/libs/match-endpoint';
import { Endpoint } from '~/server/routes/endpoint';

beforeEach(() => {
  browserEnv.restore();
});

test('If `window.location.pathname` is a valid endpoint, return the matching Endpoint', () => {
  browserEnv.stub('window.location', {
    pathname: '/send',
  });

  expect(currentEndpoint()).toBe(Endpoint.Client.SendV1);
});

test("If `window.location.pathname` is an invalid endpoint, return '*'", () => {
  browserEnv.stub('window.location', {
    pathname: '/not/a/valid/endpoint',
  });

  expect(currentEndpoint()).toBe('*');
});

test('If `window.location.pathname` matches a parameterized endpoint, return the matching endpoint', () => {
  browserEnv.stub('window.location', {
    pathname: '/preview/email',
  });

  expect(currentEndpoint()).toBe(Endpoint.Client.PreviewV1);
});
