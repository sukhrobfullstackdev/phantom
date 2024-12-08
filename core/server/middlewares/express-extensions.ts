import cookieParser from 'cookie-parser';
import cookieEncrypter from 'cookie-encrypter';
import crypto from 'crypto';
import { composeMiddleware } from './compose-middleware';
import { SIGNED_COOKIE_KEY, ENCRYPTED_COOKIE_KEY } from '../constants/env';
import { handler } from './handler-factory';

/**
 * Ensure that our Express extensions are initialized with empty objects to
 * avoid type errors.
 */
export const expressExtensions = handler((req, res, next) => {
  if (!req.ext) {
    req.ext = {
      cookies: {},
      signedCookies: {},
      headers: {},
      proxyDetails: {},
    };
  }

  if (!res.ext) {
    res.ext = {
      nonce: crypto.randomBytes(32).toString('base64'),
    };
  }

  next();
});

/**
 * Parses incoming request cookies, attaching them to `req.ext.cookies` and
 * `req.ext.signedCookies` to be strongly typed.
 */
export const parseCookies = composeMiddleware(
  !!SIGNED_COOKIE_KEY && cookieParser(SIGNED_COOKIE_KEY),
  !!ENCRYPTED_COOKIE_KEY && cookieEncrypter(ENCRYPTED_COOKIE_KEY),

  handler((req, res, next) => {
    req.ext.cookies = { ...req.cookies };
    req.ext.signedCookies = { ...req.signedCookies };
    next();
  }),
);

/**
 * Parses incoming request headers, attaching them to `req.ext.headers`
 * to be strongly typed.
 */
export const parseHeaders = handler((req, res, next) => {
  if (req.headers) {
    req.ext.headers = { ...(req.headers as any) };
  }

  next();
});
