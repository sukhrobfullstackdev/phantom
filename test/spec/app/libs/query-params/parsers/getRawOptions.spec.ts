import browserEnv from '@ikscodes/browser-env';
import { getRawOptions } from '~/app/libs/query-params/parsers';

const emptyObject = 'e30';
const params = 'eyJoZWxsbyI6IndvcmxkIiwiZm9vIjoiYmFyIn0=';
const paramsURL = 'eyJoZWxsbyI6IndvcmxkIiwiZm9vIjoiYmFyIn0%3D';

beforeEach(() => {
  browserEnv.restore();
});

test('If `window.location.search` is defined, return the raw `params` field', () => {
  browserEnv.stub('window.location', {
    search: `?params=${paramsURL}`,
  });

  expect(getRawOptions()).toEqual(params);
});

test('If `window.location.search` is empty string, return an encoded empty object', () => {
  browserEnv.stub('window.location', {
    search: '',
  });

  expect(getRawOptions()).toEqual(emptyObject);
});

test('If argument is provided for `key`, use it to select where raw options source from', () => {
  browserEnv.stub('window.location', {
    search: `?foo=${paramsURL}`,
  });

  expect(getRawOptions('foo')).toEqual(params);
});

test('If argument is provided for `key`, but that field is missing from query params, return an encoded empty object', () => {
  browserEnv.stub('window.location', {
    search: `?bar=${paramsURL}`,
  });

  expect(getRawOptions('foo')).toEqual(emptyObject);
});

test('If argument is provided for `queryParams`, use it as the source for parsing', () => {
  expect(getRawOptions('foo', `?foo=${paramsURL}`)).toEqual(params);
});
