// NOTE - if you add a code here, you must also add it to the datadog-error-classification.ts map as an 'error', 'warn', or 'info' type
export enum AuthRelayerErrorCode {
  InternalServiceError = 'auth_relayer/INTERNAL_SERVER_ERROR',
  MissingRequiredHeaders = 'auth_relayer/MISSING_REQUIRED_HEADERS',
  MissingRequiredFields = 'auth_relayer/MISSING_REQUIRED_FIELDS',
  NotFound = 'auth_relayer/NOT_FOUND',
  UnableToRefreshSession = 'auth_relayer/UNABLE_TO_REFRESH_SESSION',
  OAuthStateMismatch = 'auth_relayer/OAUTH_STATE_MISMATCH',
  OAuthCookieSignatureError = 'auth_relayer/OAUTH_COOKIE_SIGNATURE_ERROR',
  InvalidRedirectUrl = 'auth_relayer/INVALID_REDIRECT_URL',
}
