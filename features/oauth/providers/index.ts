import { SupportedOAuthProviders } from '~/features/oauth/types/oauth-configuration-types';

// Provider configurations
import { apple } from './apple';
import { bitbucket } from './bitbucket';
import { discord } from './discord';
import { facebook } from './facebook';
import { github } from './github';
import { gitlab } from './gitlab';
import { google } from './google';
import { linkedin } from './linkedin';
import { twitter } from './twitter';
import { twitch } from './twitch';
import { microsoft } from './microsoft';

export const oauthProviders: SupportedOAuthProviders = {
  apple,
  bitbucket,
  discord,
  facebook,
  github,
  gitlab,
  google,
  linkedin,
  twitter,
  twitch,
  microsoft,
};

export * as shared from './shared';
