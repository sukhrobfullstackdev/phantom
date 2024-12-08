import { createLogger, format, transports } from 'winston';
import { DATADOG_API_KEY, DEPLOY_ENV } from '~/shared/constants/env';

const httpTransportOptions = {
  host: 'http-intake.logs.datadoghq.com',
  path: `/api/v2/logs?dd-api-key=${DATADOG_API_KEY}&ddsource=nodejs&service=auth-server-${DEPLOY_ENV}&env=${DEPLOY_ENV}`,
  ssl: true,
};

export const serverLogger = createLogger({
  level: 'error',
  exitOnError: false,
  format: format.json(),
  transports: [new transports.Http(httpTransportOptions)],
});

// Example logs
// logger.log('info', 'Hello simple log!');
// logger.info('Hello log with metas', { color: 'blue' });
