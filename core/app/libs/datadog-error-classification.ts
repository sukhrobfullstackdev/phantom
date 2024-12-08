import { AuthRelayerErrorCode } from '~/server/libs/exceptions/auth-relayer-server-error-codes';
import {
  ControlFlowErrorCode,
  ContolFlowMappedErrorCode,
} from '~/app/libs/exceptions/error-types/error-codes/control-flow-error-codes';
import { MagicApiErrorCode } from '~/app/libs/exceptions/error-types/error-codes/magic-api-error-code';

export const errorClassification: ErrorClassification = {
  // Control Flow Error Codes
  // this enum will return a numeric code, ex: 0, 1, 2, 3, 4... 35, 36, 37
  [ControlFlowErrorCode.UnknownError]: 'error',
  [ControlFlowErrorCode.LoginWithMagicLinkFailedVerification]: 'warn',
  [ControlFlowErrorCode.LoginWithMagicLinkExpired]: 'info',
  [ControlFlowErrorCode.LoginRedirectLoginComplete]: 'info',
  [ControlFlowErrorCode.LoginWithMagicLinkRateLimited]: 'warn',
  [ControlFlowErrorCode.MalformedEmail]: 'warn', // threshold
  [ControlFlowErrorCode.InvalidAPIKey]: 'warn', // threshold
  [ControlFlowErrorCode.GenericServerError]: 'error',
  [ControlFlowErrorCode.RequestNotAuthorizedForDomain]: 'warn',
  [ControlFlowErrorCode.RequestNotAuthorizedForBundle]: 'warn',
  [ControlFlowErrorCode.AllowlistConfigurationRequired]: 'warn',
  [ControlFlowErrorCode.RateLimitExceeded]: 'warn',
  [ControlFlowErrorCode.APIKeyMissing]: 'warn',
  [ControlFlowErrorCode.SecretAPIKeyShouldNotBeProvided]: 'info',
  [ControlFlowErrorCode.EnhancedEmailValidation]: 'info',
  [ControlFlowErrorCode.ForbiddenForFreeDeveloperPlan]: 'info',
  [ControlFlowErrorCode.EmailUpdateConfirmLinkExpired]: 'info',
  [ControlFlowErrorCode.EmailUpdateFailedConfirmation]: 'warn',
  [ControlFlowErrorCode.DuplicateEmail]: 'info',
  [ControlFlowErrorCode.InvalidEmailUpdateToken]: 'warn',
  [ControlFlowErrorCode.OverMAUQuota]: 'warn', // threshold
  [ControlFlowErrorCode.AnomalousRequestDetected]: 'warn',
  [ControlFlowErrorCode.AnomalousRequestApprovalRequired]: 'warn',
  [ControlFlowErrorCode.EmailUpdateEmailSent]: 'info',
  [ControlFlowErrorCode.InvalidRedirectURL]: 'warn',
  [ControlFlowErrorCode.InvalidTestModeEmail]: 'info',
  [ControlFlowErrorCode.InactiveRecipient]: 'info',
  [ControlFlowErrorCode.APIAccessSuspended]: 'info',
  [ControlFlowErrorCode.UnsupportedEthereumNetwork]: 'warn',
  [ControlFlowErrorCode.UserEmailNotAllowed]: 'warn',
  [ControlFlowErrorCode.UserEmailBlocked]: 'warn',
  [ControlFlowErrorCode.DisabledAuthMethod]: 'warn',
  [ControlFlowErrorCode.MAUServiceLimitExceeded]: 'warn', // threshold
  [ControlFlowErrorCode.InvalidApiKeyType]: 'warn',
  [ControlFlowErrorCode.MagicLinkRequestedFromDifferentIp]: 'warn', // threshold
  [ControlFlowErrorCode.UserDeviceNotVerified]: 'info',
  [ControlFlowErrorCode.DeviceVerificationLinkExpired]: 'info',
  [ControlFlowErrorCode.DeviceNotSupported]: 'info',

  // Control Flow Mapped Error Codes (some of these are logged to Datadog, as found in Datadog code filter, catch all just in case)
  // example: AUTH_PASSWORDLESS_LOGIN_EMAIL_SENT
  [ContolFlowMappedErrorCode.AUTH_PASSWORDLESS_LOGIN_EMAIL_SENT]: 'warn', // LoginWithMagicLinkRateLimited
  [ContolFlowMappedErrorCode.INVALID_API_KEY]: 'warn', // InvalidAPIKey
  [ContolFlowMappedErrorCode.REQUEST_NOT_AUTHORIZED_FOR_DOMAIN]: 'warn', // RequestNotAuthorizedForDomain
  [ContolFlowMappedErrorCode.REQUEST_NOT_AUTHORIZED_FOR_BUNDLE]: 'warn', // RequestNotAuthorizedForBundle
  [ContolFlowMappedErrorCode.ALLOWLIST_CONFIGURATION_REQUIRED]: 'warn', // AllowlistConfigurationRequired
  [ContolFlowMappedErrorCode.RATE_LIMIT_EXCEEDED]: 'warn', // RateLimitExceeded
  [ContolFlowMappedErrorCode.API_KEY_IS_MISSING]: 'warn', // APIKeyMissing
  [ContolFlowMappedErrorCode.SECRET_API_KEY_SHOULD_NOT_BE_PROVIDED]: 'info', // SecretAPIKeyShouldNotBeProvided
  [ContolFlowMappedErrorCode.FORBIDDEN_FOR_FREE_DEVELOPER_PLAN]: 'info', // ForbiddenForFreeDeveloperPlan
  [ContolFlowMappedErrorCode.EXPIRED_EMAIL_UPDATE]: 'info', // EmailUpdateConfirmLinkExpired
  [ContolFlowMappedErrorCode.DUPLICATE_EMAIL]: 'info', // DuplicateEmail
  [ContolFlowMappedErrorCode.INVALID_AUTH_PASSWORDLESS_LOGIN_REQUEST]: 'info', // LoginWithMagicLinkExpired
  [ContolFlowMappedErrorCode.REDIRECT_CONTEXT_LOGIN_COMPLETED]: 'info', // LoginRedirectLoginComplete
  [ContolFlowMappedErrorCode.MALFORMED_EMAIL]: 'warn', // threshold // MalformedEmail
  [ContolFlowMappedErrorCode.ENHANCED_EMAIL_VALIDATION]: 'info', // EnhancedEmailValidation
  [ContolFlowMappedErrorCode.INVALID_EMAIL_UPDATE_TOKEN]: 'warn', // InvalidEmailUpdateToken
  [ContolFlowMappedErrorCode.OVER_MAU_QUOTA]: 'warn', // threshold // OverMAUQuota
  [ContolFlowMappedErrorCode.ANOMALOUS_REQUEST_DETECTED]: 'warn', // AnomalousRequestDetected
  [ContolFlowMappedErrorCode.ANOMALOUS_REQUEST_APPROVAL_REQUIRED]: 'warn', // AnomalousRequestApprovalRequired
  [ContolFlowMappedErrorCode.MAGIC_LINK_REQUESTED_FROM_DIFFERENT_IP]: 'warn', // threshold // MagicLinkRequestedFromDifferentIp
  [ContolFlowMappedErrorCode.EMAIL_UPDATE_EMAIL_SENT]: 'info', // EmailUpdateEmailSent
  [ContolFlowMappedErrorCode.INVALID_REDIRECT_URL]: 'warn', // InvalidRedirectURL
  [ContolFlowMappedErrorCode.APP_DOMAIN_AND_REDIRECT_URL_DOMAIN_MISMATCH]: 'warn', // InvalidRedirectURL
  [ContolFlowMappedErrorCode.INACTIVE_RECIPIENT]: 'info', // InactiveRecipient
  [ContolFlowMappedErrorCode.API_ACCESS_SUSPENDED]: 'info', // APIAccessSuspended
  [ContolFlowMappedErrorCode.AUTH_METHOD_FORBIDDEN]: 'warn', // DisabledAuthMethod
  [ContolFlowMappedErrorCode.UNSUPPORTED_ETHEREUM_NETWORK]: 'warn', // UnsupportedEthereumNetwork
  [ContolFlowMappedErrorCode.EMAIL_NOT_ALLOWED]: 'warn', // UserEmailNotAllowed
  [ContolFlowMappedErrorCode.EMAIL_BLOCKED]: 'warn', // UserEmailBlocked
  [ContolFlowMappedErrorCode.DEVICE_NOT_VERIFIED]: 'info', // UserDeviceNotVerified
  [ContolFlowMappedErrorCode.MAU_SERVICE_LIMIT_EXCEEDED]: 'warn', // MAUServiceLimitExceeded
  [ContolFlowMappedErrorCode.INVALID_API_KEY_TYPE]: 'warn', // InvalidApiKeyType
  [ContolFlowMappedErrorCode.DEVICE_NOT_SUPPORTED]: 'info', // DeviceNotSupported

  // Auth Relayer Server Error Codes
  [AuthRelayerErrorCode.InternalServiceError]: 'error',
  [AuthRelayerErrorCode.MissingRequiredHeaders]: 'warn',
  [AuthRelayerErrorCode.MissingRequiredFields]: 'warn',
  [AuthRelayerErrorCode.NotFound]: 'warn',
  [AuthRelayerErrorCode.UnableToRefreshSession]: 'info',
  [AuthRelayerErrorCode.OAuthStateMismatch]: 'error',
  [AuthRelayerErrorCode.OAuthCookieSignatureError]: 'warn',
  [AuthRelayerErrorCode.InvalidRedirectUrl]: 'warn',

  // RPC error codes, all other codes will fall back to warns
  // https://docs.alchemy.com/reference/error-reference#json-rpc-error-codes
  '-32600': 'error', // Invalid Request
  '-32603': 'error', // Internal error
  '-32000': 'error', // Server error

  // Other error codes found in Datadog that are not in Relayer, pulled from this query in DD
  // https://app.datadoghq.com/logs?query=service%3Aauth-prod%20&agg_q=%40code&analyticsOptions=%5B%22bars%22%2C%22dog_classic%22%2Cnull%2Cnull%5D&cols=host%2Cservice&index=%2A&messageDisplay=inline&refresh_mode=sliding&sort_m=&sort_t=&stream_sort=desc&top_n=100&top_o=top&view=spans&viz=query_table&x_missing=true&from_ts=1698027057875&to_ts=1700619057875&live=true
  ECONNABORTED: 'error',

  // Magic API Error Codes (error)
  [MagicApiErrorCode.INTERNAL_SERVER_ERROR]: 'error',
  [MagicApiErrorCode.AUTH_USER_REDIRECT_LOGIN_ERROR]: 'error',
  [MagicApiErrorCode.ETHEREUM_PROVIDER_INTERNAL_SERVER_ERROR]: 'error',
  [MagicApiErrorCode.MALFORMED_ATTEMPT_INPUTS_ERROR]: 'error',

  // Magic API Error Codes (warn), duplicates from Control Flow Errors removed from the map below
  [MagicApiErrorCode.FAILED_TO_CHARGE_ERROR]: 'warn',
  [MagicApiErrorCode.MISSING_REQUIRED_FIELDS]: 'warn',
  [MagicApiErrorCode.INVALID_REQUEST_FIELDS]: 'warn',
  [MagicApiErrorCode.MALFORMED_PHONE_NUMBER]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_COUNTRY_CODE]: 'warn',
  [MagicApiErrorCode.UNTRUSTWORTHY_PHONE_NUMBER]: 'warn',
  [MagicApiErrorCode.INCORRECT_CLIENT_ID]: 'warn',
  [MagicApiErrorCode.INCORRECT_API_KEY_ID]: 'warn',
  [MagicApiErrorCode.INCORRECT_API_KEY_SECRET]: 'warn',
  [MagicApiErrorCode.INCORRECT_PHONE_VERIFICATION_CODE]: 'warn',
  [MagicApiErrorCode.PHONE_VERIFICATION_CODE_EXPIRED]: 'warn',
  [MagicApiErrorCode.INVALID_MAGIC_API_USER]: 'warn',
  [MagicApiErrorCode.INVALID_SOURCE_OR_DESTINATION_CURRENCY]: 'warn',
  [MagicApiErrorCode.INCORRECT_CURRENCY_UNIT]: 'warn',
  [MagicApiErrorCode.UNKNOWN_CONTRACT_CALL]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_CONTRACT_TYPE]: 'warn',
  [MagicApiErrorCode.INVALID_CONTRACT_ADDRESS]: 'warn',
  [MagicApiErrorCode.INCORRECT_SIGNER_ADDRESS]: 'warn',
  [MagicApiErrorCode.INSUFFICIENT_BALANCE]: 'warn',
  [MagicApiErrorCode.TOO_MANY_TRANSACTIONS_IN_PROGRESS]: 'warn',
  [MagicApiErrorCode.TRANSACTION_NOT_FOUND]: 'warn',
  [MagicApiErrorCode.UNKNOWN_JSON_RPC_METHOD]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_LEDGER_NETWORK]: 'warn',
  [MagicApiErrorCode.RESOURCE_NOT_FOUND]: 'warn',
  [MagicApiErrorCode.RESOURCE_EXISTS]: 'warn',
  [MagicApiErrorCode.RESOURCE_LIMIT_REACHED]: 'warn',
  [MagicApiErrorCode.API_KEY_NOT_AUTHORIZED]: 'warn',
  [MagicApiErrorCode.INVALID_USER_SESSION]: 'warn',
  [MagicApiErrorCode.INVALID_API_USER_SESSION]: 'warn',
  [MagicApiErrorCode.INVALID_MAGIC_API_USER_SESSION]: 'warn',
  [MagicApiErrorCode.INVALID_FACTOR_TYPE]: 'warn',
  [MagicApiErrorCode.INVALID_FEDERATED_IDENTITY_TOKEN]: 'warn',
  [MagicApiErrorCode.INVALID_FEDERATED_IDENTITY_PROVIDER]: 'warn',
  [MagicApiErrorCode.USER_SESSION_EXPIRED]: 'warn',
  [MagicApiErrorCode.MAGIC_API_USER_SESSION_EXPIRED]: 'warn',
  [MagicApiErrorCode.API_USER_SESSION_EXPIRED]: 'warn',
  [MagicApiErrorCode.USER_SESSION_INVALID_FOR_CLIENT]: 'warn',
  [MagicApiErrorCode.API_USER_SESSION_INVALID_FOR_CLIENT]: 'warn',
  [MagicApiErrorCode.MAGIC_API_USER_SESSION_INVALID_FOR_TEAM]: 'warn',
  [MagicApiErrorCode.MAGIC_API_USER_SESSION_INVALID_FOR_CLIENT]: 'warn',
  [MagicApiErrorCode.USER_NOT_LOGGED_IN]: 'warn',
  [MagicApiErrorCode.INFURA_REQUEST_METHOD_ERROR]: 'warn',
  [MagicApiErrorCode.INFURA_JSON_RPC_RESPONSE_ERROR]: 'warn',
  [MagicApiErrorCode.INFURA_INTERNAL_SERVER_ERROR]: 'warn',
  [MagicApiErrorCode.ETHEREUM_PROVIDER_REQUEST_METHOD_ERROR]: 'warn',
  [MagicApiErrorCode.ETHEREUM_PROVIDER_JSON_RPC_RESPONSE_ERROR]: 'warn',
  [MagicApiErrorCode.UNKNOWN_USER]: 'warn',
  [MagicApiErrorCode.AUTHORIZATION_HEADER_VALUE_ERROR]: 'warn',
  [MagicApiErrorCode.PROVIDER_RATE_LIMIT_EXCEEDED]: 'warn',
  [MagicApiErrorCode.REQUEST_NOT_AUTHORIZED]: 'warn',
  [MagicApiErrorCode.REQUEST_FORBIDDEN]: 'warn',
  [MagicApiErrorCode.SOFT_ACCOUNT_LOCK_PERIOD_FOR_USER]: 'warn',
  [MagicApiErrorCode.USER_PIN_INCORRECT]: 'warn',
  [MagicApiErrorCode.USER_PIN_UNSET]: 'warn',
  [MagicApiErrorCode.USER_PIN_LOCKED_PERMANENTLY]: 'warn',
  [MagicApiErrorCode.USER_PIN_HAS_BEEN_SET]: 'warn',
  [MagicApiErrorCode.INVALID_USER_PIN]: 'warn',
  [MagicApiErrorCode.INVALID_USER_AUTH_TYPE]: 'warn',
  [MagicApiErrorCode.MISSING_GITHUB_EMAIL]: 'warn',
  [MagicApiErrorCode.MISSING_GITHUB_OAUTH_TOKEN]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_VERIFY_EMAIL]: 'warn',
  [MagicApiErrorCode.DUPLICATE_USER_EMAIL]: 'warn',
  [MagicApiErrorCode.USER_HAS_VERIFIED_EMAIL]: 'warn',
  [MagicApiErrorCode.WAITING_ON_USER_EMAIL_VERIFICATION]: 'warn',
  [MagicApiErrorCode.TEMPORARY_USER_PIN]: 'warn',
  [MagicApiErrorCode.USER_MISSING_EMAIL]: 'warn',
  [MagicApiErrorCode.USER_PIN_MISMATCH]: 'warn',
  [MagicApiErrorCode.BAD_REQUEST]: 'warn',
  [MagicApiErrorCode.NON_EXISTENT_CLIENT_USER]: 'warn',
  [MagicApiErrorCode.CHALLENGE_NOT_MET]: 'warn',
  [MagicApiErrorCode.VERIFICATION_IN_PROGRESS]: 'warn',
  [MagicApiErrorCode.VERIFICATION_COMPLETED]: 'warn',
  [MagicApiErrorCode.MISSING_EXPORT_KEY_CONSEQUENCES_ACK]: 'warn',
  [MagicApiErrorCode.MISSING_EXPORT_KEY_TOS_ACK]: 'warn',
  [MagicApiErrorCode.PASSWORD_REQUIREMENT_NOT_MET]: 'warn',
  [MagicApiErrorCode.EXPORT_REASON_EXCEEDS_CHAR_LIMIT]: 'warn',
  [MagicApiErrorCode.INVALID_DOMAIN]: 'warn',
  [MagicApiErrorCode.INVALID_WHITELIST_ACCESS]: 'warn',
  [MagicApiErrorCode.INCORRECT_TWO_FA_CODE]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_ENABLE_TWO_FA]: 'warn',
  [MagicApiErrorCode.WALLET_EXISTS_FOR_NETWORK]: 'warn',
  [MagicApiErrorCode.WALLET_EXISTS_FOR_AUTH_USER]: 'warn',
  [MagicApiErrorCode.INVALID_WALLET_TYPE]: 'warn',
  [MagicApiErrorCode.WALLET_MANAGEMENT_NOT_SUPPORTED_FOR_EXPORT]: 'warn',
  [MagicApiErrorCode.TWO_FA_ALREADY_ENABLED]: 'warn',
  [MagicApiErrorCode.PUBLIC_API_KEY_SHOULD_NOT_BE_PROVIDED]: 'warn',
  [MagicApiErrorCode.MISSING_PUBLIC_ADDRESSES]: 'warn',
  [MagicApiErrorCode.TOO_MANY_PUBLIC_ADDRESSES]: 'warn',
  [MagicApiErrorCode.INVALID_PUBLIC_ADDRESS_FORMAT]: 'warn',
  [MagicApiErrorCode.JSON_CONTENT_NOT_PROVIDED]: 'warn',
  [MagicApiErrorCode.WRONG_INPUT_TYPE]: 'warn',
  [MagicApiErrorCode.USER_FAILED_AUTHENTICATION]: 'warn',
  [MagicApiErrorCode.PHONE_XOR_EMAIL]: 'warn',
  [MagicApiErrorCode.UNVERIFIED_EMAIL_LOGIN]: 'warn',
  [MagicApiErrorCode.INCORRECT_VERIFICATION_CODE]: 'warn',
  [MagicApiErrorCode.MAX_ATTEMPTS_EXCEEDED]: 'warn',
  [MagicApiErrorCode.VERIFICATION_CODE_EXPIRED]: 'warn',
  [MagicApiErrorCode.MAX_TRIES_EXCEEDED]: 'warn',
  [MagicApiErrorCode.VERIFY_PROVIDER_ERROR]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_SEND_VERIFICATION_CODE]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_VERIFY_VERIFICATION_CODE]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_CREATE_PASSWORD]: 'warn',
  [MagicApiErrorCode.USER_PASSWORD_HAS_BEEN_SET]: 'warn',
  [MagicApiErrorCode.FORBIDDEN_TO_CREATE_PASSWORD]: 'warn',
  [MagicApiErrorCode.USER_PASSWORD_LOCKED_PERMANENTLY]: 'warn',
  [MagicApiErrorCode.USER_EMAIL_SOURCE_NOT_ALLOWED]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_AUTHENTICATE]: 'warn',
  [MagicApiErrorCode.FORBIDDEN_TO_AUTHENTICATE]: 'warn',
  [MagicApiErrorCode.FORBIDDEN_TO_UPDATE_PASSWORD]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_UPDATE_PASSWORD]: 'warn',
  [MagicApiErrorCode.FIAT_ONRAMP_LOGIN_REQUIRED_AGAIN]: 'warn',
  [MagicApiErrorCode.FIAT_ONRAMP_PROVIDER_SERVICE_ERROR]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_WALLET_TYPE]: 'warn',
  [MagicApiErrorCode.AUTH_USER_NOT_LOGGED_IN]: 'warn',
  [MagicApiErrorCode.AUTH_USER_SESSION_INVALID_FOR_CLIENT]: 'warn',
  [MagicApiErrorCode.DID_TOKEN_INVALID_FOR_CLIENT]: 'warn',
  [MagicApiErrorCode.AUTH_USER_SESSION_EXPIRED]: 'warn',
  [MagicApiErrorCode.INVALID_AUTH_USER_SESSION]: 'warn',
  [MagicApiErrorCode.WYRE_ORDER_STATUS_NOT_FOUND]: 'warn',
  [MagicApiErrorCode.AUTH_PASSWORDLESS_LOGIN_NOT_VERIFIED]: 'warn',
  [MagicApiErrorCode.ALREADY_WHITELISTED_DOMAIN]: 'warn',
  [MagicApiErrorCode.ALREADY_WHITELISTED_BUNDLE]: 'warn',
  [MagicApiErrorCode.ALREADY_WHITELISTED_REDIRECT_URL]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_WHITELIST_TYPE]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_DOMAIN]: 'warn',
  [MagicApiErrorCode.REQUEST_ENTITY_TOO_LARGE]: 'warn',
  [MagicApiErrorCode.MISSING_REQUIRED_HEADER]: 'warn',
  [MagicApiErrorCode.MAGIC_AUTHORIZATION_HEADER_VALUE_ERROR]: 'warn',
  [MagicApiErrorCode.INVALID_DID_TOKEN]: 'warn',
  [MagicApiErrorCode.MISMATCH_DID_TOKEN_SIGNER]: 'warn',
  [MagicApiErrorCode.DID_TOKEN_HAS_EXPIRED]: 'warn',
  [MagicApiErrorCode.DID_TOKEN_CANNOT_BE_USED_NOW]: 'warn',
  [MagicApiErrorCode.CONFLICTING_HEADERS]: 'warn',
  [MagicApiErrorCode.MALFORMED_DID_ISSUER]: 'warn',
  [MagicApiErrorCode.INVALID_MAGIC_SUBSCRIPTION_PLAN]: 'warn',
  [MagicApiErrorCode.NOT_ELIGIBLE_TO_UPGRADE_PLAN]: 'warn',
  [MagicApiErrorCode.NOT_ELIGIBLE_TO_DOWNGRADE_PLAN]: 'warn',
  [MagicApiErrorCode.NOT_ELIGIBLE_TO_CANCEL_PLAN]: 'warn',
  [MagicApiErrorCode.NOT_ELIGIBLE_TO_START_FREE_TRIAL_PLAN]: 'warn',
  [MagicApiErrorCode.INVALID_AUTH_USER_SESSION_REFRESH]: 'warn',
  [MagicApiErrorCode.REQUEST_NOT_AUTHORIZED_FOR_ADMIN_AUTH]: 'warn',
  [MagicApiErrorCode.PREVENT_PHONE_CALL_SPAMMING]: 'warn',
  [MagicApiErrorCode.PREVENT_SMS_SPAMMING]: 'warn',
  [MagicApiErrorCode.PREVENT_EMAIL_SPAMMING]: 'warn',
  [MagicApiErrorCode.WEBAUTHN_REGISTRATION_FAILED]: 'warn',
  [MagicApiErrorCode.PROHIBIT_DELETING_LAST_WEBAUTHN_DEVICE]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_PARSE_REFERRER]: 'warn',
  [MagicApiErrorCode.INVALID_RECAPTCHA_RESPONSE]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_FIND_WEBAUTHN_CREDENTIALS]: 'warn',
  [MagicApiErrorCode.FAILED_TO_VERIFY_ASSERTION_RESPONSE]: 'warn',
  [MagicApiErrorCode.INVALID_EMAIL_UPDATE_REQUEST_ID]: 'warn',
  [MagicApiErrorCode.INVALID_OAUTH_REQUEST]: 'warn',
  [MagicApiErrorCode.OAUTH_REQUEST_CHALLENGE_MISMATCH]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_OAUTH_PROVIDER]: 'warn',
  [MagicApiErrorCode.UNSUPPORTED_THIRD_PARTY_WALLET_PROVIDER]: 'warn',
  [MagicApiErrorCode.REQUEST_VALIDATION_ERROR]: 'warn',
  [MagicApiErrorCode.TMP_AUTH_TOKEN_IS_DISABLED]: 'warn',
  [MagicApiErrorCode.FAILED_TO_UPDATE_OAUTH_APP]: 'warn',
  [MagicApiErrorCode.FAILED_TO_CREATE_OAUTH_APP]: 'warn',
  [MagicApiErrorCode.FAILED_TO_DELETE_OAUTH_APP]: 'warn',
  [MagicApiErrorCode.AUTH_USER_MISSING_EMAIL_FOR_REDIRECT_LOGIN]: 'warn',
  [MagicApiErrorCode.EPHEMERAL_AUTH_USER_SESSION_NOT_ALLOWED]: 'warn',
  [MagicApiErrorCode.INVALID_EPHEMERAL_AUTH_USER_SESSION]: 'warn',
  [MagicApiErrorCode.REDIRECT_URL_NOT_IN_WHITELIST]: 'warn',
  [MagicApiErrorCode.UNAUTHORIZED_DOMAIN]: 'warn',
  [MagicApiErrorCode.TWO_FA_METHOD_UNAVAILABLE]: 'warn',
  [MagicApiErrorCode.OAUTH_PROVIDER_APP_VALIDATION_ERROR]: 'warn',
  [MagicApiErrorCode.NUMBER_OF_CLIENTS_PER_USER_EXCEEDED]: 'warn',
  [MagicApiErrorCode.IP_RATE_LIMIT_EXCEEDED]: 'warn',
  [MagicApiErrorCode.EXPORT_AUTH_WALLET_FORBIDDEN]: 'warn',
  [MagicApiErrorCode.UNRECOGNIZED_POSTMARK_RECORD_TYPE]: 'warn',
  [MagicApiErrorCode.EMAIL_NOT_DELIVERED]: 'warn',
  [MagicApiErrorCode.INVALID_FILE_UPLOAD]: 'warn',
  [MagicApiErrorCode.NO_STORED_CC_ERROR]: 'warn',
  [MagicApiErrorCode.INVALID_ALCHEMY_WEBHOOK_REQUEST]: 'warn',
  [MagicApiErrorCode.INVALID_OAUTH2_PRIVATE_KEY]: 'warn',
  [MagicApiErrorCode.USER_NOT_FOUND]: 'warn',
  [MagicApiErrorCode.INVALID_ACCESS_CONTROL_LIST]: 'warn',
  [MagicApiErrorCode.INVALID_ACCESS_CONTROL_LIST_SIZE]: 'warn',
  [MagicApiErrorCode.LOGIN_THROTTLED]: 'warn',
  [MagicApiErrorCode.INVALID_AUTH_METHODS]: 'warn',
  [MagicApiErrorCode.AUTH_METHODS_NOT_FOUND]: 'warn',
  [MagicApiErrorCode.SEARCH_QUERY_TOO_SHORT]: 'warn',
  [MagicApiErrorCode.CANNOT_DISABLE_MFA]: 'warn',
  [MagicApiErrorCode.CANNOT_ENABLE_THIRD_PARTY_WALLET]: 'warn',
  [MagicApiErrorCode.TEAM_DOES_NOT_EXIST]: 'warn',
  [MagicApiErrorCode.TEAM_INVITE_SEND_FAILED]: 'warn',
  [MagicApiErrorCode.TEAM_INVITE_ALREADY_ACCEPTED]: 'warn',
  [MagicApiErrorCode.TEAM_INVITE_CANCELED]: 'warn',
  [MagicApiErrorCode.MAGIC_API_USER_NOT_FOUND]: 'warn',
  [MagicApiErrorCode.SMTP_CONNECTION_ERROR]: 'warn',
  [MagicApiErrorCode.SMTP_AUTHENTICATION_ERROR]: 'warn',
  [MagicApiErrorCode.WEB3_TRANSACTION_ERROR]: 'warn',
  [MagicApiErrorCode.STRIPE_CUSTOMER_DOES_NOT_EXIST]: 'warn',
  [MagicApiErrorCode.STRIPE_SUBSCRIPTION_ALREADY_EXISTS]: 'warn',
  [MagicApiErrorCode.STRIPE_PAYMENT_METHOD_NOT_FOUND]: 'warn',
  [MagicApiErrorCode.FIAT_ON_RAMP_CUSTOMER_IS_NOT_ALLOWED]: 'warn',
  [MagicApiErrorCode.FIAT_ON_RAMP_UNSUPPORTED_LOCATION]: 'warn',
  [MagicApiErrorCode.EXTRA_TEAM_SEATS_ENABLED]: 'warn',
  [MagicApiErrorCode.CUSTOM_SMTP_CONFIG_ENABLED]: 'warn',
  [MagicApiErrorCode.CUSTOM_SESSION_CONFIG_ENABLED]: 'warn',
  [MagicApiErrorCode.MFA_USER_EXISTS]: 'warn',
  [MagicApiErrorCode.REQUEST_AMAZON_FAILED]: 'warn',
  [MagicApiErrorCode.INVALID_THIRD_PARTY_WALLET_NONCE]: 'warn',
  [MagicApiErrorCode.INVALID_THIRD_PARTY_WALLET_SIGNATURE]: 'warn',
  [MagicApiErrorCode.INVALID_THIRD_PARTY_WALLET_MESSAGE_FORMAT]: 'warn',
  [MagicApiErrorCode.MULTI_FACTOR_NOT_SUPPORTED_FOR_VERIFY_FLOW]: 'warn',
  [MagicApiErrorCode.FAILED_CALL_TO_EXTERNAL_PROVIDER]: 'warn',
  [MagicApiErrorCode.EXTERNAL_PROVIDER_IS_DOWN]: 'warn',
  [MagicApiErrorCode.INVALID_IDENTIFIER_TYPE_FOR_PUBLIC_ADDRESS]: 'warn',
  [MagicApiErrorCode.MAX_TEAM_SEATS_EXCEEDED]: 'warn',
  [MagicApiErrorCode.MISSING_AUTH_USER_LOGIN_FLOW_ERROR]: 'warn',
  [MagicApiErrorCode.EXPIRED_AUTH_USER_LOGIN_FLOW]: 'warn',
  [MagicApiErrorCode.DEPRECATED]: 'warn',
  [MagicApiErrorCode.RECOVERY_FACTOR_ALREADY_EXISTS]: 'warn',
  [MagicApiErrorCode.WALLET_FLAGGED]: 'warn',
  [MagicApiErrorCode.INVALID_CUSTOM_AUTHORIZATION_TOKEN]: 'warn',
  [MagicApiErrorCode.UNABLE_TO_CONNECT_TO_AUTHORIZATION_SERVER]: 'warn',
  [MagicApiErrorCode.ACCOUNT_ALREADY_EXISTS]: 'warn',
  [MagicApiErrorCode.FACTOR_VERIFIER_CREDENTIAL_NOT_ALLOWED]: 'warn',
  [MagicApiErrorCode.FACTOR_VERIFIER_CREDENTIAL_SUBJECT_MISMATCH]: 'warn',
  [MagicApiErrorCode.INVALID_FACTOR_VERIFIER_CREDENTIALS]: 'warn',
  [MagicApiErrorCode.INVALID_EMAILS]: 'warn',
  [MagicApiErrorCode.CLIENT_IS_NOT_ENTERPRISE]: 'warn',
  [MagicApiErrorCode.CUSTOM_SMTP_NOT_CONFIGURED]: 'warn',
  [MagicApiErrorCode.RESOURCE_ALREADY_EXISTS]: 'warn',
  [MagicApiErrorCode.DPOP_VALIDATION_ERROR]: 'warn',
  [MagicApiErrorCode.ACCOUNT_LINKING_VALIDATION_ERROR]: 'warn',
};

type LoggerType = 'info' | 'warn' | 'error';

export interface ErrorClassification {
  [key: string]: LoggerType;
}

export const getLoggerType = (
  errorCode: string | number | null,
): { loggerType: LoggerType; codeFoundInErrorMap: boolean } => {
  const loggerType = errorClassification[errorCode as string];
  if (loggerType) return { loggerType, codeFoundInErrorMap: true };
  // any erorrs not in errorClassification will be logged as warn
  // group / filter by "codeFoundInErrorMap" in Datadog to review any errors that should be added to errorClassification
  return { loggerType: 'warn', codeFoundInErrorMap: false };
};
