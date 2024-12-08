// OAuth errors returned from the client-side do not follow the usual error
// flows. We need the capability to return these errors as "successful"
// responses in the JSON RPC result so they can be formatted by the Magic OAuth
// extension client.

interface OAuthStandardError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

enum OAuthErrorCode {
  InvalidRequest = 'invalid_request',
  ServerError = 'server_error',
}

/**
 * OAuth error representing a mismatch in the `state` parameter, indicating a
 * possible forged request.
 */
export function createStateMismatchOAuthError(): OAuthStandardError {
  return {
    error: OAuthErrorCode.InvalidRequest,
    error_description: 'State parameter mismatches.',
  };
}

/**
 * A generic server error indicating failure to retrieve the OAuth access token.
 */
export function createAccessTokenRetrieveOAuthError(): OAuthStandardError {
  return {
    error: OAuthErrorCode.ServerError,
    error_description: `Failed to retrieve OAuth access token.`,
  };
}

/**
 * A generic server error indicating failure to generate the `magic_credential`
 * during the final, client-side step of the OAuth flow.
 */
export function createFailedToGenerateCredentialOAuthError(): OAuthStandardError {
  return {
    error: OAuthErrorCode.ServerError,
    error_description: `Failed to generate temporary magic credential.`,
  };
}

/**
 * A generic server error indicating failure to start the OAuth flow.
 */
export function createStartOAuthError(): OAuthStandardError {
  return {
    error: OAuthErrorCode.ServerError,
    error_description: `Failed to initiate OAuth authorization.`,
  };
}

export function createVerifyOAuthError(): OAuthStandardError {
  return {
    error: OAuthErrorCode.ServerError,
    error_description: `Failed to finish OAuth verification.`,
  };
}

/**
 * OAuth error representing redirectUrl not included in the allowlist from client config
 */
export function createInvalidRedirectUrlOAuthError(): OAuthStandardError {
  return {
    error: OAuthErrorCode.InvalidRequest,
    error_description: 'Invalid redirect url.',
  };
}

/**
 * OAuth error representing a required redirect allowlist is missing.
 */
export function createRedirectAllowlistRequiredOAuthError(): OAuthStandardError {
  return {
    error: OAuthErrorCode.InvalidRequest,
    error_description: 'Redirect allowlist is required.',
  };
}
