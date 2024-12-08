import { LoginMethodType } from '~/app/constants/flags';
import { createBaseLoginButton } from './base-login-button';
import { i18n } from '~/app/libs/i18n';

export const LoginButton = {
  // --- Primary login providers

  [LoginMethodType.EmailLink]: createBaseLoginButton({
    loginType: LoginMethodType.EmailLink,
    textLabel: i18n.pnp.email,
    ariaLabel: i18n.pnp.email_aria,
  }),

  [LoginMethodType.SMS]: createBaseLoginButton({
    loginType: LoginMethodType.SMS,
    textLabel: i18n.pnp.phone,
    ariaLabel: i18n.pnp.phone_aria,
  }),

  // --- Social login providers

  apple: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'apple',
    textLabel: 'Apple',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  bitbucket: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'bitbucket',
    textLabel: 'BitBucket',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  discord: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'discord',
    textLabel: 'Discord',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  facebook: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'facebook',
    textLabel: 'Facebook',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  github: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'github',
    textLabel: 'GitHub',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  gitlab: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'gitlab',
    textLabel: 'GitLab',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  google: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'google',
    textLabel: 'Google',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  linkedin: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'linkedin',
    textLabel: 'LinkedIn',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  microsoft: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'microsoft',
    textLabel: 'Microsoft',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  twitch: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'twitch',
    textLabel: 'Twitch',
    ariaLabel: i18n.pnp.login_using_aria,
  }),

  twitter: createBaseLoginButton({
    loginType: LoginMethodType.OAuth2,
    loginArg: 'twitter',
    textLabel: 'Twitter',
    ariaLabel: i18n.pnp.login_using_aria,
  }),
};
