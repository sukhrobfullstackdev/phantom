/*
  eslint-disable

  no-nested-ternary,
  @typescript-eslint/restrict-plus-operands
*/

import chalk from 'chalk';
import { Request, Response } from 'express';
import { URL } from 'url';
import { IS_NODE_ENV_DEV } from '~/shared/constants/env';
import { pickBy } from '~/shared/libs/object-helpers';
import { DeepPartial } from '~/shared/types/utility-types';
import { getSerializableErrorData } from '../libs/exceptions';
import { prettyConsole } from '../libs/pretty-console';
import { publicPath } from '../webpack/webpack-utils';
import { handler } from './handler-factory';

type HRTime = [number, number];

const didLog = Symbol('has this request previously been logged already?');
const startTime = Symbol('starting timestamp for the incoming request');

function getDuration(start: HRTime) {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const MS_TO_S = 1000;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS / MS_TO_S;
}

function createURLSafely(input?: string, base?: string) {
  try {
    return new URL(input!, base);
  } catch {
    return input;
  }
}

/**
 * Creates a logging function that can be attached to Node's 'close' or 'finish'
 * event handlers. We assume the `req` and `res` could be undefined because this
 * middleware is run before our `req` extensions are bootstrapped.
 */
function log(req?: DeepPartial<Request>, res?: DeepPartial<Response>) {
  return () => {
    if (req?.[didLog]) return;

    const err = req?.ext?.currentError as Error | undefined;
    const errorData = err && getSerializableErrorData(err);

    if (IS_NODE_ENV_DEV) {
      // Log something pretty & legible for development
      const statusCode = res?.statusCode ?? 500;
      const statusColor = statusCode < 400 ? 'green' : statusCode < 500 ? 'yellow' : 'red';

      // In case the `req` path is proxied, we want to show
      // the original request path in our development logs, too.
      const urlLabel =
        req?.originalUrl === req?.url
          ? req?.originalUrl
          : chalk`${req?.originalUrl} {gray.dim ❯} ${createURLSafely(req?.url, req?.ext?.proxyDetails?.target)}`;

      if (!urlLabel?.startsWith(publicPath) && !urlLabel?.startsWith('/__webpack_hmr')) {
        console.log(chalk`{gray [${req?.method}]} ${chalk[statusColor](statusCode)} ${urlLabel}`);
      }

      if (errorData) {
        prettyConsole.spacer();
        prettyConsole.error(err);
        prettyConsole.spacer();
      }
    } else {
      // Log something parseable & informative for production
      const json = JSON.stringify(
        pickBy({
          method: req?.method,
          path: req?.originalUrl ?? req?.url,
          status_code: res?.statusCode,
          timestamp: Date.now(),
          resp_time: getDuration(req?.[startTime]),
          log_level: (res?.statusCode ?? 500) >= 400 ? 'ERROR' : 'INFO',
          headers: pickBy({
            'x-magic-trace-id': req?.ext?.headers?.['x-magic-trace-id'],
          }),
          ...errorData,
        }),
      );

      console.log(json);
    }

    if (req) req[didLog] = true;
  };
}

/**
 * Log API requests with relevant metadata.
 */
export const logRequests = handler((req, res, next) => {
  req[startTime] = process.hrtime();

  req.once('close', log(req, res));
  req.once('finish', log(req, res));

  next();
});
