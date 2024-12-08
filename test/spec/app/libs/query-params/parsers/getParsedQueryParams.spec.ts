import browserEnv from '@ikscodes/browser-env';
import { getParsedQueryParams } from '~/app/libs/query-params/parsers';

beforeEach(() => {
  browserEnv.restore();
});

test('If `window.location.search` is defined, return an object of its parsed data', () => {
  browserEnv.stub('window.location', {
    search: '?hello=world&foo=bar',
  });

  expect(getParsedQueryParams()).toEqual({ hello: 'world', foo: 'bar' });
});

test('If `window.location` is undefined, return an empty object', () => {
  browserEnv.stub('window.location', undefined);
  expect(getParsedQueryParams()).toEqual({});
});

test('If `window.location.search` is empty string, return an empty object', () => {
  browserEnv.stub('window.location', {
    search: '',
  });

  expect(getParsedQueryParams()).toEqual({});
});

test('If argument is provided, use it in place of `window.location.search`', () => {
  expect(getParsedQueryParams('?bar=baz&goodbye=world')).toEqual({ bar: 'baz', goodbye: 'world' });
});

test('If argument has "?" prefix, removes it before parsing', () => {
  expect(getParsedQueryParams('?foo=bar')).toEqual({ foo: 'bar' });
});

test('If argument has "#" prefix, removes it before parsing', () => {
  expect(getParsedQueryParams('#foo=bar')).toEqual({ foo: 'bar' });
});

test('If argument does not have "?" or "#" prefix, parses correctly', () => {
  expect(getParsedQueryParams('foo=bar')).toEqual({ foo: 'bar' });
});
