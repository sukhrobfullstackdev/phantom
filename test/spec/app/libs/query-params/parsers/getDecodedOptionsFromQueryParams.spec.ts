import browserEnv from '@ikscodes/browser-env';
import { getDecodedOptionsFromQueryParams } from '~/app/libs/query-params/parsers';

const decodedParams = { hello: 'world', foo: 'bar' };
const paramsURL = 'eyJoZWxsbyI6IndvcmxkIiwiZm9vIjoiYmFyIn0%3D';
const paramsURLGzipped = 'eJyrVspIzcnJV7JSKs8vyklR0lFKywfxkhKLlGoBkBAJXg%3D%3D';
const brokenParamsURL = 'eyJoZWxsbyI6IndxkIiwiZm9vIjoiYmFyIn0%3D';

beforeEach(() => {
  browserEnv.restore();
});

test('If `window.location.search` is defined, return an object of its parsed data', () => {
  browserEnv.stub('window.location', {
    search: `?params=${paramsURL}`,
  });

  expect(getDecodedOptionsFromQueryParams()).toEqual(decodedParams);
});

test('If `window.location.search` is empty string, return an empty object', () => {
  browserEnv.stub('window.location', {
    search: '',
  });

  expect(getDecodedOptionsFromQueryParams()).toEqual({});
});

test('If argument is provided for `key`, use it to select where raw options source from', () => {
  browserEnv.stub('window.location', {
    search: `?foo=${paramsURL}`,
  });

  expect(getDecodedOptionsFromQueryParams('foo')).toEqual(decodedParams);
});

test('If argument is provided for `key`, but that field is missing from query params, return an empty object', () => {
  browserEnv.stub('window.location', {
    search: `?bar=${paramsURL}`,
  });

  expect(getDecodedOptionsFromQueryParams('foo')).toEqual({});
});

test('If argument is provided for `queryParams`, use it as the source for parsing', () => {
  expect(getDecodedOptionsFromQueryParams('foo', `?foo=${paramsURL}`)).toEqual(decodedParams);
});

test('If params are not JSON parseable, return an empty object', () => {
  browserEnv.stub('window.location', {
    search: `?params=${brokenParamsURL}`,
  });

  expect(getDecodedOptionsFromQueryParams()).toEqual({});
});

test('If params are Gzipped, return an object of its parsed data', () => {
  browserEnv.stub('window.location', {
    search: `?params=${paramsURLGzipped}`,
  });

  expect(getDecodedOptionsFromQueryParams()).toEqual(decodedParams);
});
