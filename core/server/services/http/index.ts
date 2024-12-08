import { internalMagicRestUtilities } from './internal-magic-rest';
import { oauthRestUtilities } from './oauth-rest';

export * from './withHeaders';

export const HttpService = {
  internalMagic: internalMagicRestUtilities,
  oauth: oauthRestUtilities,
};
