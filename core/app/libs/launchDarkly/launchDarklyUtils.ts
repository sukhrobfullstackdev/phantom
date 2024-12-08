import { LaunchDarklyFeatureFlags, LaunchDarklySettings } from '~/app/libs/launchDarkly/launchDarklyTypes';

// maps LD flags from the settings object via LaunchDarkly stream to a flat object with the current boolean value
export const getChangedLaunchDarklyFeatureFlags = (input: LaunchDarklySettings): Partial<LaunchDarklyFeatureFlags> => {
  const launchDarklyFlags: Partial<LaunchDarklyFeatureFlags> = {};

  for (const key in input) {
    if (key in input) launchDarklyFlags[key] = input[key].current;
  }

  return launchDarklyFlags;
};
