import { datadogLogs, Logger } from '@datadog/browser-logs';
import { datadogRum } from '@datadog/browser-rum';
import {
  DATADOG_CLIENT_KEY,
  DATADOG_RUM_APP_KEY,
  DATADOG_RUM_CLIENT_KEY,
  DEPLOY_ENV,
  IS_DEPLOY_ENV_PROD,
} from '~/shared/constants/env';
import { getBaseProperties } from './analytics-datadog-helpers';

datadogLogs.init({
  clientToken: DATADOG_CLIENT_KEY,
  site: 'datadoghq.com',
  service: `auth-${DEPLOY_ENV}`,
  forwardErrorsToLogs: false, // Set to false out because it was sending objects to DataDog as [Object object]
  useCrossSiteSessionCookie: true,
  env: DEPLOY_ENV,
  sessionSampleRate: 100,
  beforeSend() {
    return DEPLOY_ENV !== 'local';
  },
});

/* Use a Proxy to maintain the ability to use the
shorthand methods (like .log, .debug, .info, .warn, .error),
while allowing for getBaseProperties to be computed */
let proxiedLogger: Logger;

export function getLogger(): Logger {
  if (!proxiedLogger) {
    const baseLogger = datadogLogs.logger;

    proxiedLogger = new Proxy(baseLogger, {
      get(target, prop) {
        if (['log', 'debug', 'info', 'warn', 'error'].includes(prop.toString())) {
          return (message: string, properties?: Record<string, any>) => {
            const baseProperties = getBaseProperties();
            const combinedProperties = { ...baseProperties, ...properties };

            // Invoke the original logger method with the combined properties
            target[prop](message, combinedProperties);
          };
        }

        // If the property isn't one of the log methods, return the original property
        return target[prop];
      },
    });
  }

  return proxiedLogger;
}

if (DATADOG_RUM_APP_KEY && DATADOG_RUM_CLIENT_KEY) {
  datadogRum.init({
    applicationId: DATADOG_RUM_APP_KEY,
    clientToken: DATADOG_RUM_CLIENT_KEY,
    site: 'datadoghq.com',
    service: `relayer-${DEPLOY_ENV}`,
    env: DEPLOY_ENV,
    sessionSampleRate: IS_DEPLOY_ENV_PROD ? 0.1 : 100,
    // replay sample rate is the percent of tracked sessions
    // so 10% of the above 10% is 1% of all sessions.
    sessionReplaySampleRate: 0,
    trackUserInteractions: true,
    trackResources: true,
    useCrossSiteSessionCookie: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask',
    allowedTracingUrls: [
      'https://api.magic.link',
      'https://auth.magic.link',
      'https://api-a.prod.magic-corp.link',
      'https://api.fortmatic.com',
      'https://dashboard.magic.link',
      'https://auth.dev.magic.link',
      'https://auth.stagef.magic.link',
      'https://dashboard.dev.magic.link',
      'https://dashboard.stagef.magic.link',
      'https://api.dev.magic.link',
      'https://api.stagef.magic.link',
      'https://next.env.magic.link',
    ],
  });

  datadogRum.startSessionReplayRecording();
}

export function getMonitoring() {
  return datadogRum;
}
