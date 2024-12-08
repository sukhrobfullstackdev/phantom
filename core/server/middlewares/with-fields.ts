import { RequestHandler, Params, ParamsDictionary } from 'express';
import { ensureArray } from '~/shared/libs/array-helpers';
import { composeMiddleware } from './compose-middleware';
import { coreHttpErrors } from '../libs/exceptions';
import { handler } from './handler-factory';

/**
 * Enforces the given `fields` are present on either the request body or query.
 */
function requireFields(fields: string | string[]) {
  return handler((req, res, next) => {
    const nonMatchingFields = ensureArray(fields).filter(field => {
      const isInBody = Object.keys(req.body ?? {}).includes(field);
      const isInQuery = Object.keys(req.query ?? {}).includes(field);

      return !isInBody && !isInQuery;
    });

    if (nonMatchingFields.length) {
      // throw coreHttpErrors.MissingRequiredFields(nonMatchingFields);
    }

    next();
  });
}

/**
 * Marshalls data for the given `fields` from the request `body` or `query` (in
 * that order), which is then provided to the `handlerFactory` given in the
 * returned function.
 */
export function withFields<T extends Record<string, any>>(
  requiredFields: Exclude<keyof T, number | symbol>[] = [],
  optionalFields: Exclude<keyof T, number | symbol>[] = [],
) {
  const marshalledFieldData = Symbol('marshalled field data');

  return <TParams extends Params = ParamsDictionary>(
    handlerFactory: (fieldData: T) => RequestHandler<TParams>,
  ): RequestHandler<TParams> => {
    return handler((req, res, next) => {
      // Optimization: We marshall field datas only once. This allows the
      // middleware factory to be re-used without duplicating the field
      // validations [which is O(n) complexity].
      if (req[marshalledFieldData]) return handler(handlerFactory(req[marshalledFieldData]))(req, res, next);

      return composeMiddleware(
        requireFields(requiredFields),

        () => {
          req[marshalledFieldData] = {};

          [...requiredFields, ...optionalFields].forEach(field => {
            if (req.body && req.body[field]) {
              req[marshalledFieldData][field] = req.body[field];
            } else if (req.query && req.query[field]) {
              req[marshalledFieldData][field] = req.query[field];
            }
          });

          return handler(handlerFactory(req[marshalledFieldData]))(req, res, next);
        },
      )(req as any, res, next);
    });
  };
}
