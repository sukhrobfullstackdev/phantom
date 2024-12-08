import * as LaunchDarklyClient from 'launchdarkly-js-client-sdk';
import { getErrorMessage } from '~/app/libs/exceptions/error-handler';
import { getApiKey } from '~/app/libs/api-key';

import { LAUNCH_DARKLY_CLIENT_ID } from '~/shared/constants/env';
import { setLaunchDarklyFeatureFlags } from '~/app/store/system/system.actions';
import { store } from '~/app/store';
import { LaunchDarklyFeatureFlags, LaunchDarklySettings } from '~/app/libs/launchDarkly/launchDarklyTypes';
import { getChangedLaunchDarklyFeatureFlags } from '~/app/libs/launchDarkly/launchDarklyUtils';
import { getLogger } from '~/app/libs/datadog';

export const initLaunchDarkly = async () => {
  const context = {
    kind: 'user',
    key: getApiKey() || 'fallback',
  };

  const client = LaunchDarklyClient.initialize(LAUNCH_DARKLY_CLIENT_ID, context, {
    logger: LaunchDarklyClient.basicLogger({ level: 'none' }),
  });
  try {
    await client.waitForInitialization();
    const flags: LaunchDarklyFeatureFlags = client.allFlags() as LaunchDarklyFeatureFlags;
    store.dispatch(setLaunchDarklyFeatureFlags(flags));

    client.on('change', settings => {
      const changedFlags = getChangedLaunchDarklyFeatureFlags(settings as LaunchDarklySettings);
      const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
      store.dispatch(setLaunchDarklyFeatureFlags({ ...LAUNCH_DARKLY_FEATURE_FLAGS, ...changedFlags }));
    });
  } catch (e) {
    getLogger().error(`Error while fetching LaunchDarkly flags`, { message: getErrorMessage(e) });
  }
};
