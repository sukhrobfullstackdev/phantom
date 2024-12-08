import { ensureArray } from '~/shared/libs/array-helpers';
import { AllowedHeaders } from '../constants/allowed-headers';
import { coreHttpErrors } from '../libs/exceptions';
import { handler } from './handler-factory';

export function requireHeaders(headers: AllowedHeaders | AllowedHeaders[]) {
  return handler((req, res, next) => {
    const nonMatchingHeaders = ensureArray(headers).filter(header => {
      return !Object.keys(req.ext.headers).includes(header);
    });

    if (nonMatchingHeaders.length) {
      throw coreHttpErrors.MissingRequiredHeaders(nonMatchingHeaders);
    }

    next();
  });
}
