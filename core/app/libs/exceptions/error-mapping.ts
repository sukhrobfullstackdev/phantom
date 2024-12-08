import { ErrorMapping } from './error-utils';
import { sdkErrorFactories } from './sdk-error-factories';
import { i18n } from '../i18n';
import {
  ControlFlowErrorCode,
  ContolFlowMappedErrorCode,
} from '~/app/libs/exceptions/error-types/error-codes/control-flow-error-codes';

const none = null;

/**
 * This mapping configures high-level declarations of application "error flows."
 * Here, we associate `ControlFlowError` types with source `ServiceError` types
 * and a destination `SDKError` type.
 */
export const errorMapping: ErrorMapping = () => ({
  [ControlFlowErrorCode.UnknownError]: {
    fromServiceError: none,
    toSDKError: none,
  },

  [ControlFlowErrorCode.GenericServerError]: {
    fromServiceError: none,
    toSDKError: source => sdkErrorFactories.rpc.internalError(source.displayMessage),
  },

  [ControlFlowErrorCode.LoginWithMagicLinkRateLimited]: {
    fromServiceError: ContolFlowMappedErrorCode.AUTH_PASSWORDLESS_LOGIN_EMAIL_SENT,
    toSDKError: sdkErrorFactories.magic.magicLinkRateLimited(),
  },

  [ControlFlowErrorCode.InvalidAPIKey]: {
    fromServiceError: ContolFlowMappedErrorCode.INVALID_API_KEY,
    toSDKError: sdkErrorFactories.client.invalidAPIKey(),
  },

  [ControlFlowErrorCode.RequestNotAuthorizedForDomainInRelayer]: {
    fromServiceError: ContolFlowMappedErrorCode.REQUEST_NOT_AUTHORIZED_FOR_DOMAIN_IN_RELAYER,
    toSDKError: sdkErrorFactories.client.requestNotAuthorizedForDomainInRelayer(),
  },

  [ControlFlowErrorCode.RequestNotAuthorizedForDomain]: {
    fromServiceError: ContolFlowMappedErrorCode.REQUEST_NOT_AUTHORIZED_FOR_DOMAIN,
    toSDKError: source => sdkErrorFactories.client.requestNotAuthorizedForDomain(source.displayMessage),
  },

  [ControlFlowErrorCode.RequestNotAuthorizedForBundle]: {
    fromServiceError: ContolFlowMappedErrorCode.REQUEST_NOT_AUTHORIZED_FOR_BUNDLE,
    toSDKError: source => sdkErrorFactories.client.requestNotAuthorizedForBundle(source.displayMessage),
  },

  [ControlFlowErrorCode.AllowlistConfigurationRequired]: {
    fromServiceError: ContolFlowMappedErrorCode.ALLOWLIST_CONFIGURATION_REQUIRED,
    toSDKError: source => sdkErrorFactories.client.allowlistConfigurationRequired(source.displayMessage),
  },

  [ControlFlowErrorCode.RateLimitExceeded]: {
    fromServiceError: ContolFlowMappedErrorCode.RATE_LIMIT_EXCEEDED,
    toSDKError: source => sdkErrorFactories.client.rateLimitExceeded(source.displayMessage),
  },

  [ControlFlowErrorCode.APIKeyMissing]: {
    fromServiceError: ContolFlowMappedErrorCode.API_KEY_IS_MISSING,
    toSDKError: sdkErrorFactories.client.apiKeyMissing(),
  },

  [ControlFlowErrorCode.SecretAPIKeyShouldNotBeProvided]: {
    fromServiceError: ContolFlowMappedErrorCode.SECRET_API_KEY_SHOULD_NOT_BE_PROVIDED,
    toSDKError: sdkErrorFactories.client.secretAPIKeyShouldNotBeUsed(),
  },

  [ControlFlowErrorCode.ForbiddenForFreeDeveloperPlan]: {
    fromServiceError: ContolFlowMappedErrorCode.FORBIDDEN_FOR_FREE_DEVELOPER_PLAN,
    toSDKError: source => sdkErrorFactories.magic.forbiddenForFreeDeveloper(source.displayMessage),
  },

  [ControlFlowErrorCode.EmailUpdateConfirmLinkExpired]: {
    fromServiceError: ContolFlowMappedErrorCode.EXPIRED_EMAIL_UPDATE,
    toSDKError: sdkErrorFactories.magic.emailUpdateConfirmLinkExpired(),
  },

  [ControlFlowErrorCode.DuplicateEmail]: {
    fromServiceError: ContolFlowMappedErrorCode.DUPLICATE_EMAIL,
    toSDKError: sdkErrorFactories.magic.duplicateEmail(),
  },

  [ControlFlowErrorCode.LoginWithMagicLinkExpired]: {
    fromServiceError: ContolFlowMappedErrorCode.INVALID_AUTH_PASSWORDLESS_LOGIN_REQUEST,
    toSDKError: sdkErrorFactories.magic.magicLinkExpired(),
  },
  [ControlFlowErrorCode.LoginRedirectLoginComplete]: {
    fromServiceError: ContolFlowMappedErrorCode.REDIRECT_CONTEXT_LOGIN_COMPLETED,
    toSDKError: sdkErrorFactories.magic.redirectLoginComplete(),
  },
  [ControlFlowErrorCode.LoginWithMagicLinkFailedVerification]: {
    fromServiceError: none,
    toSDKError: sdkErrorFactories.magic.magicLinkFailedVerification(),
  },
  [ControlFlowErrorCode.MalformedEmail]: {
    fromServiceError: ContolFlowMappedErrorCode.MALFORMED_EMAIL,
    toSDKError: sdkErrorFactories.magic.malformedEmail(),
    fallbackDisplayMessage: i18n.generic.please_provide_valid_email.toString(),
  },

  [ControlFlowErrorCode.EnhancedEmailValidation]: {
    fromServiceError: ContolFlowMappedErrorCode.ENHANCED_EMAIL_VALIDATION,
    toSDKError: sdkErrorFactories.magic.malformedEmail(),
  },

  [ControlFlowErrorCode.EmailUpdateFailedConfirmation]: {
    fromServiceError: none,
    toSDKError: sdkErrorFactories.magic.emailUpdateFailedConfirmation(),
  },

  [ControlFlowErrorCode.InvalidEmailUpdateToken]: {
    fromServiceError: ContolFlowMappedErrorCode.INVALID_EMAIL_UPDATE_TOKEN,
    toSDKError: sdkErrorFactories.magic.emailUpdateFailedConfirmation(),
  },

  [ControlFlowErrorCode.OverMAUQuota]: {
    fromServiceError: ContolFlowMappedErrorCode.OVER_MAU_QUOTA,
    toSDKError: source => sdkErrorFactories.client.overMAUQuota(source.displayMessage),
  },

  [ControlFlowErrorCode.AnomalousRequestDetected]: {
    fromServiceError: ContolFlowMappedErrorCode.ANOMALOUS_REQUEST_DETECTED,
    overrideDisplayMessage: `We've detected unusual activity.`,
    toSDKError: source => sdkErrorFactories.client.anomalousRequestDetected(source.displayMessage),
  },
  [ControlFlowErrorCode.AnomalousRequestApprovalRequired]: {
    fromServiceError: ContolFlowMappedErrorCode.ANOMALOUS_REQUEST_APPROVAL_REQUIRED,
    toSDKError: source => sdkErrorFactories.client.anomalousRequestDetected(source.displayMessage),
  },
  [ControlFlowErrorCode.MagicLinkRequestedFromDifferentIp]: {
    fromServiceError: ContolFlowMappedErrorCode.MAGIC_LINK_REQUESTED_FROM_DIFFERENT_IP,
    toSDKError: source => sdkErrorFactories.client.anomalousRequestDetected(source.displayMessage),
  },

  [ControlFlowErrorCode.EmailUpdateEmailSent]: {
    fromServiceError: ContolFlowMappedErrorCode.EMAIL_UPDATE_EMAIL_SENT,
    toSDKError: sdkErrorFactories.magic.emailUpdateFailedConfirmation(),
  },

  [ControlFlowErrorCode.InvalidRedirectURL]: {
    fromServiceError: [
      ContolFlowMappedErrorCode.INVALID_REDIRECT_URL,
      ContolFlowMappedErrorCode.APP_DOMAIN_AND_REDIRECT_URL_DOMAIN_MISMATCH,
    ],
    toSDKError: source => sdkErrorFactories.magic.invalidRedirectURL(source.displayMessage),
    fallbackDisplayMessage:
      'Invalid redirect URL provided. Please make sure the redirect origin is whitelisted in Magic Dashboard.',
  },

  [ControlFlowErrorCode.InvalidTestModeEmail]: {
    fromServiceError: none,
    toSDKError: sdkErrorFactories.magic.invalidTestModeEmail(),
    fallbackDisplayMessage: 'Please provide a valid test mode email address.',
  },

  [ControlFlowErrorCode.InactiveRecipient]: {
    fromServiceError: ContolFlowMappedErrorCode.INACTIVE_RECIPIENT,
    toSDKError: source => sdkErrorFactories.magic.inactiveRecipient(source.displayMessage),
    fallbackDisplayMessage: `We were unable to deliver a Magic Link to the specified email address.`,
  },

  [ControlFlowErrorCode.APIAccessSuspended]: {
    fromServiceError: ContolFlowMappedErrorCode.API_ACCESS_SUSPENDED,
    toSDKError: source => sdkErrorFactories.magic.apiAccessSuspended(source.displayMessage),
    fallbackDisplayMessage:
      'Your account has been suspended. Please contact us at support@magic.link to restore your account.',
  },

  [ControlFlowErrorCode.DisabledAuthMethod]: {
    fromServiceError: ContolFlowMappedErrorCode.AUTH_METHOD_FORBIDDEN,
    toSDKError: source => sdkErrorFactories.magic.disabledAuthMethod(source.displayMessage),
    fallbackDisplayMessage: 'The requested auth method is disabled. Please enable it in your dashboard to use.',
  },

  [ControlFlowErrorCode.UnsupportedEthereumNetwork]: {
    fromServiceError: ContolFlowMappedErrorCode.UNSUPPORTED_ETHEREUM_NETWORK,
    toSDKError: source => sdkErrorFactories.rpc.invalidParamsError(source.displayMessage),
  },
  [ControlFlowErrorCode.UserEmailNotAllowed]: {
    fromServiceError: ContolFlowMappedErrorCode.EMAIL_NOT_ALLOWED,
    toSDKError: source => sdkErrorFactories.magic.userEmailAccessDenied(source.displayMessage),
  },
  [ControlFlowErrorCode.UserEmailBlocked]: {
    fromServiceError: ContolFlowMappedErrorCode.EMAIL_BLOCKED,
    toSDKError: source => sdkErrorFactories.magic.userEmailAccessDenied(source.displayMessage),
  },
  [ControlFlowErrorCode.UserDeviceNotVerified]: {
    fromServiceError: ContolFlowMappedErrorCode.DEVICE_NOT_VERIFIED,
    toSDKError: source => sdkErrorFactories.magic.userDeviceNotVerified(),
  },
  [ControlFlowErrorCode.DeviceVerificationLinkExpired]: {
    fromServiceError: ContolFlowMappedErrorCode.INVALID_AUTH_PASSWORDLESS_LOGIN_REQUEST,
    toSDKError: sdkErrorFactories.magic.magicLinkExpired(),
  },

  [ControlFlowErrorCode.MAUServiceLimitExceeded]: {
    fromServiceError: ContolFlowMappedErrorCode.MAU_SERVICE_LIMIT_EXCEEDED,
    toSDKError: source => sdkErrorFactories.magic.mauServiceLimitExceeded(source.displayMessage),
    fallbackDisplayMessage:
      'You have exceeded the max MAU, please upgrade your plan in Magic Dashboard immediately to unblock users',
  },

  [ControlFlowErrorCode.InvalidApiKeyType]: {
    fromServiceError: ContolFlowMappedErrorCode.INVALID_API_KEY_TYPE,
    toSDKError: sdkErrorFactories.client.apiKeyMismatch(),
  },

  [ControlFlowErrorCode.DeviceNotSupported]: {
    fromServiceError: ContolFlowMappedErrorCode.DEVICE_NOT_SUPPORTED,
    toSDKError: sdkErrorFactories.magic.userDeviceNotVerified(),
  },
});
