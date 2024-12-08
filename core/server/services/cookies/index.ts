import { Response, CookieOptions } from 'express';
import { CookieName, CookieType } from '~/shared/constants/cookies';
import { defaultCookieConfig } from './cookie-config';

export const CookieService = {
  /**
   * Set a cookie on the `res` object given to the `CookieService` factory.
   */
  set<T extends CookieName>(res: Response, name: T, value?: CookieType<T>, overrideOptions: CookieOptions = {}) {
    res.cookie(name, value, { ...defaultCookieConfig[name](), ...overrideOptions });
  },

  /**
   * Clears a cookie on the `res` object given to the `CookieService` factory.
   */
  clear<T extends CookieName>(res: Response, name: T) {
    res.clearCookie(name);
  },
};
