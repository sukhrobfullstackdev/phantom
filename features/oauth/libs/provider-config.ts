import { oauthProviders } from '../providers';
import { legacyTwitter, twitter } from '../providers/twitter';
import { OAuthProviderConfig } from '../types/oauth-configuration-types';

export function getProviderConfig(provider: string, version = 2): OAuthProviderConfig {
  const dualisticProviders = {
    twitter: {
      1: legacyTwitter,
      2: twitter,
    },
  };

  if (dualisticProviders[provider]?.[version]) {
    return dualisticProviders[provider][version];
  }

  return oauthProviders[provider];
}
