import { LaunchDarklyFeatureFlags, LaunchDarklySettings } from '~/app/libs/launchDarkly/launchDarklyTypes';
import { getChangedLaunchDarklyFeatureFlags } from '~/app/libs/launchDarkly/launchDarklyUtils';

describe('get changed LaunchDarkly flags', () => {
  test('should return only the current flag values from the Launch Darkly settings', () => {
    const input: LaunchDarklySettings = {
      'is-send-funds-enabled': {
        current: true,
        previous: false,
      },
      'is-third-party-wallets-enabled': {
        current: true,
        previous: false,
      },
      'is-verified-application': {
        current: false,
        previous: true,
      },
      'is-fiat-on-ramp-enabled': {
        current: false,
        previous: true,
      },
    };
    const expected: Partial<LaunchDarklyFeatureFlags> = {
      'is-send-funds-enabled': true,
      'is-third-party-wallets-enabled': true,
      'is-verified-application': false,
      'is-fiat-on-ramp-enabled': false,
    };
    expect(getChangedLaunchDarklyFeatureFlags(input)).toEqual(expected);
  });

  test('should return an empty object for an empty input', () => {
    const input = {} as LaunchDarklySettings;
    const expected: Partial<LaunchDarklyFeatureFlags> = {};
    expect(getChangedLaunchDarklyFeatureFlags(input)).toEqual(expected);
  });
});
