import { createServiceError } from './exceptions';

export function mockApiReject(error_code: string, message: string) {
  return Promise.reject(createServiceError({ error_code, message }));
}

export function mockApiResponse<T>(data: T) {
  return Promise.resolve({
    data,
    error_code: '',
    message: '',
    status: 'ok',
  });
}
