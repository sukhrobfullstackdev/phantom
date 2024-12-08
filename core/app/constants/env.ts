/* eslint-disable prefer-destructuring */

export const IS_LEGACY_BUNDLE = Boolean(Number(process.env.IS_ES5));
export const PUBLIC_PATH = process.env.PUBLIC_PATH!;
export const RECAPTCHA_KEY = process.env.REACT_APP_GOOGLE_RECAPTCHA_KEY || '6LeNFhYnAAAAAOdT8FTDslkbnybTudMivXQ8P6TU';
