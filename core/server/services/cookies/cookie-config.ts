import { CookieOptions } from 'express';
import { CookieName } from '~/shared/constants/cookies';
import { IS_NODE_ENV_PROD } from '~/shared/constants/env';

type CookieConfiguration = {
  [P in CookieName]: () => CookieOptions;
};

const MAX_AGE_30_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_AGE_10_MINUTES_IN_MS = 10 * 60 * 1000;
export const defaultCookieConfig: CookieConfiguration = {
  _aurt: () => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: IS_NODE_ENV_PROD,
    maxAge: MAX_AGE_30_DAYS_IN_MS,
    signed: true,
  }),

  _aucsrf: () => ({
    sameSite: 'strict',
    secure: IS_NODE_ENV_PROD,
    maxAge: MAX_AGE_30_DAYS_IN_MS,
    plain: true,
  }),

  _ct: () => ({
    sameSite: 'lax',
    secure: IS_NODE_ENV_PROD,
    plain: true,
  }),

  _oaclientmeta: () => ({
    sameSite: 'strict',
    maxAge: MAX_AGE_10_MINUTES_IN_MS,
    secure: IS_NODE_ENV_PROD,
    plain: true,
  }),

  _oaservermeta: () => ({
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_NODE_ENV_PROD,
    maxAge: MAX_AGE_10_MINUTES_IN_MS,
    signed: true,
  }),

  _oarid: () => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: IS_NODE_ENV_PROD,
    maxAge: MAX_AGE_10_MINUTES_IN_MS,
    signed: true,
  }),

  _lfc: () => ({
    sameSite: 'strict',
    secure: IS_NODE_ENV_PROD,
    maxAge: MAX_AGE_10_MINUTES_IN_MS,
    signed: false,
    plain: true,
  }),

  _mfafr: () => ({
    sameSite: 'strict',
    secure: IS_NODE_ENV_PROD,
    maxAge: MAX_AGE_10_MINUTES_IN_MS,
    signed: true,
  }),

  _bundleId: () => ({
    sameSite: 'strict',
    secure: IS_NODE_ENV_PROD,
    maxAge: MAX_AGE_10_MINUTES_IN_MS,
    signed: false,
    plain: true,
  }),
};
