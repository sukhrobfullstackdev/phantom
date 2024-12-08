import { Request } from 'express';
import { PlatformType } from '~/features/oauth/types/oauth-metadata';
import { MGBOX_API_URL } from '~/server/constants/mobile-mgbox-url';

export function getReferrerFromHeaders(req: Request, platform?: PlatformType): string | undefined {
  // In mobile, a domain whitelist checks if referrer is mgbox prior the mobile bundle whitelist check.
  // In the OAuth flow started by a mobile SDK, the referrer in the popup window is empty
  // This block is to override the referrer to ensure domain whitelisting passed for mobile
  if (platform === 'rn') {
    return MGBOX_API_URL;
  }
  return req.headers['x-magic-referrer'] ?? req.headers.referer;
}
