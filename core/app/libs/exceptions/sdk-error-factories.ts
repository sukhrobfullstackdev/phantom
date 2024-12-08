import { createSDKError } from './error-types/sdk-error';

// We disable prettier to enforce one line per error factory definition, making
// this particular module easier to parse visually.
/* eslint-disable prettier/prettier */

/*

  The comments in this file are designed to be noticed. Please, read them
  carefully. Failing to do so may cause breaking changes for SDK users!


  +--------------------------------------------------------------------------+
  | Please observe the CUSTOM ERROR CODE ranges listed above each            |
  | SDK error mapping.                                                       |
  |                                                                          |
  | For each category of SDK error, you may either use an in-range custom    |
  | error code or one of the standard JSON RPC 2.0 error types               |
  | (those contained in the `rpc` error mapping).                            |
  +--------------------------------------------------------------------------+

 */

/**
 * Standard JSON RPC 2.0 errors
 *
 *   +---------------------------------------+
 *   |           PLEASE REFERENCE:           |
 *   | https://www.jsonrpc.org/specification |
 *   +---------------------------------------+
 *
 */
const rpc = {
  parseError: (message?: string) => createSDKError(-32700, 'Parse error', message),
  invalidRequestError: (message?: string) => createSDKError(-32600, 'Invalid request', message),
  methodNotFoundError: (message?: string) => createSDKError(-32601, 'Method not found', message),
  invalidParamsError: (message?: string) => createSDKError(-32602, 'Invalid params', message),
  internalError: (message?: string) => createSDKError(-32603, 'Internal error', message),
};

/**
 * Client errors (analogous to 4xx HTTP errors)
 *
 *   +--------------------------+
 *   | CUSTOM ERROR CODE RANGE: |
 *   |     -32000 to -32099     |
 *   +--------------------------+
 *
 */
const client = {
  missingPayloadBatch: () => rpc.invalidRequestError('Missing payload batch.'),
  missingRpcVersion: () => rpc.invalidRequestError('Missing payload JSON RPC version.'),
  missingPayloadId: () => rpc.invalidRequestError('Missing payload id.'),
  malformedPayload: () => rpc.invalidRequestError('Payload is malformed.'),
  duplicatePayload: (payloadMethod: string) =>
    rpc.internalError(
      `A JSON RPC payload with the method \`${payloadMethod}\` is already being processed. Allow the first request to resolve before queuing another. This method is not designed for execution inside a polling interval. If you invoke this method from an event listener, remember to debounce the side effect.`,
    ),
  userDeniedAccountAccess: () => rpc.internalError('User denied account access.'),
  invalidSubscription: () => rpc.internalError('This feature requires a Universal Wallet Pro Bundle Subscription.'),
  invalidAPIKey: () => rpc.internalError('Given API key is invalid. Please try again.'),
  apiKeyMismatch: () =>
    rpc.internalError(
      'Mismatched API key. Make sure you are not using a Dedicated Wallet API key for Universal Wallet.',
    ),
  apiKeyMissing: () => rpc.internalError('API key is missing. Please try again.'),
  secretAPIKeyShouldNotBeUsed: () =>
    rpc.internalError('Secret API key should not be used with the client-side SDK. Please try again.'),
  requestNotAuthorizedForDomain: (message: string) => rpc.internalError(message),
  requestNotAuthorizedForDomainInRelayer: () =>
    rpc.internalError(
      'Unauthorized Domain. Please visit dashboard.magic.link to add your domain and refresh the page.',
    ),
  requestNotAuthorizedForBundle: (message: string) => rpc.internalError(message),
  allowlistConfigurationRequired: (message: string) => rpc.internalError(message),
  rateLimitExceeded: (message: string) => rpc.internalError(message),
  userCanceledAction: () => rpc.internalError('User canceled action.'),
  userIncompleteRequest: () => rpc.internalError('User did not complete request.'),
  webAuthnRegistrationFailed: () => rpc.invalidRequestError('Failed to register WebAuthn device.'),
  webAuthnLoggedInError: () => rpc.invalidRequestError('User is not logged in with WebAuthn!'),
  overMAUQuota: (message: string) => rpc.internalError(message),
  anomalousRequestDetected: (message: string) => rpc.internalError(message),
  webAuthnUnableFindDevice: () => rpc.invalidRequestError('Unable to find the device.'),
  testModeEmailFailureAssertion: (code: number, email: string) =>
    createSDKError(code, `Test mode error. You asserted this error by providing the following email address: ${email}`),
  insecureEnvironment: () =>
    createSDKError(-32603, 'Current environment is insecure, please check your browser environment'),
};

/**
 * Widget/Web3 flow-specific errors
 *
 *   +--------------------------+
 *   | CUSTOM ERROR CODE RANGE: |
 *   |     -10100 to -10199     |
 *   +--------------------------+
 *
 */
const web3 = {
  userDeniedTransaction: () => rpc.internalError('User denied transaction.'),
  userDeniedSigning: () => rpc.internalError('User denied signing.'),
  unsupportedEVM: () => rpc.internalError('The provided network is not supported.'),
  unsupportedWallet: () => rpc.internalError('The provided wallet type is not enabled.'),
  unsupportedConnectMethod: () => rpc.internalError('Unsupported Universal Wallet method.'),
  walletUINotEnabledForApp: functionName =>
    rpc.internalError(
      `${functionName} is not enabled on this app. See the developer dashboard to configure the feature.`,
    ),
  underpricedReplacementTransaction: () => rpc.invalidRequestError('Replacement transaction underpriced.'),
  invalidTransaction: () => rpc.invalidRequestError('Invalid transaction.'),
  failedWalletCreation: () => rpc.internalError('Failed to sync wallet'),
  unsupportedEVMMethodForGlobalWalletApps: evm_method =>
    rpc.internalError(
      `EVM Method: ${evm_method} is unsupported for global wallet apps. Please use API keys from a scoped app instead.`,
    ),
  unsupportedBlockchain: () =>
    rpc.internalError('Blockchain not supported. Please select a different blockchain network.'),
  gaslessTransactionsNotEnabled: () => rpc.internalError('Gasless transactions not enabled'),
  notMatchLoggedInUser: () => rpc.internalError('Address parameter does not match logged in user'),
  missingParameter: (parameterName: string) => rpc.internalError(`Missing ${parameterName} parameter`),
  errorConnectingToBlockchain: () => rpc.internalError('Could not connect to provided rpc url.'),
  nftCheckoutPaymentFailed: () => rpc.internalError('You have not been charged.'),
  nftCheckoutSoldOut: () => rpc.internalError('This item is no longer available.'),
  insufficientFunds: () => rpc.internalError('Insufficient funds.'),
  unknownError: () => rpc.internalError('An unknown error occurred.'),
};

/**
 * Magic/Phantom flow-specific errors
 *
 *   +--------------------------+
 *   | CUSTOM ERROR CODE RANGE: |
 *   |     -10000 to -10099     |
 *   +--------------------------+
 *
 */
const magic = {
  magicLinkFailedVerification: () => createSDKError(-10000, 'Logging in with magic link failed verification.'),
  magicLinkExpired: () => createSDKError(-10001, 'Logging in with magic link failed because the link is expired.'),
  magicLinkRateLimited: () =>
    createSDKError(
      -10002,
      'Logging in with magic link failed because the magic link rate limit has been reached. Please try again in ~5s.',
    ),
  userAlreadyLoggedIn: () =>
    createSDKError(
      -10003,
      'A user is already logged in. Please logout the current user before starting another login flow.',
    ),
  malformedEmail: () => rpc.invalidParamsError('Please provide a valid email address.'),
  forbiddenForFreeDeveloper: (message: string) => rpc.internalError(message),
  emailUpdateConfirmLinkExpired: () =>
    createSDKError(-10004, 'Email update failed because update confirmation links are expired.'),
  emailUpdateFailedConfirmation: () =>
    createSDKError(-10004, 'Email update could not be confirmed. Please try again later.'),
  duplicateEmail: () => rpc.invalidParamsError('Provided email is already in use.'),
  userRequestEditEmail: () => createSDKError(-10005, 'User requests to edit the email address for authentication.'),
  invalidRedirectURL: (message: string) => createSDKError(-10006, message),
  walletTypeNotSupport: () => createSDKError(-10007, 'Only support ETH wallet export!'),
  invalidTestModeEmail: () => createSDKError(-10008, 'Please provide a valid test mode email address.'),
  unknowTestModeError: () => createSDKError(-10009, 'The provided test mode failure reason is invalid.'),
  inactiveRecipient: (message: string) => createSDKError(-10010, message),
  apiAccessSuspended: (message: string) => rpc.internalError(message),
  disabledAuthMethod: (message: string) => rpc.internalError(message),
  userEmailAccessDenied: (message: string) => createSDKError(-10011, message),
  userCancelLogin: () => createSDKError(-10011, 'User canceled login'),
  userRejectAction: () => createSDKError(-10012, 'User rejected the action'),
  unsupportedMFA: () => createSDKError(-10013, 'Magic Email OTP Whitelabeling does not support MFA.'),
  requestCancelled: () => createSDKError(-10014, 'Request has been cancelled'),
  mauServiceLimitExceeded: (message: string) => rpc.internalError(message),
  unsupportedSDKMethodGeneric: () => rpc.internalError('Your app does not support this method.'),
  unsupportedSDKMethodForGlobalWalletApps: () =>
    rpc.internalError('Your app does not support this method, use an API key from a Dedicated Wallet app instead.'),
  unsupportedSDKMethodForScopedWalletApps: (message: string) => rpc.internalError(message),
  redirectLoginComplete: () => createSDKError(-10015, 'User has completed authentication in the redirect window'),
  userDeviceNotVerified: () => createSDKError(-10016, 'User device not verified'),
  deviceVerificationLinkExpired: () =>
    createSDKError(-10017, 'Logging in failed because the device verification link is expired.'),
};

/**
 * Icon errors
 *
 *   +--------------------------+
 *   | CUSTOM ERROR CODE RANGE: |
 *   |      -9900 to -9999      |
 *   +--------------------------+
 *
 */
const icon = {
  iconError: (message?: string) => createSDKError(-9999, 'Icon error', message),
};

/**
 * A data structure containing all `SDKError` factories.
 */
export const sdkErrorFactories = {
  rpc,
  client,
  web3,
  magic,
  icon,
};
