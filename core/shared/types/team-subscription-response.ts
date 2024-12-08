import { CustomBrandingType, ThemeType } from './theme';

/**
 * This is the interface Magic API uses to represent team subscription data.
 */
export interface TeamSubscriptionInfo {
  enabled_features: SubscriptionFeature[];
}

export enum SubscriptionFeature {
  CONNECT_PREMIUM = 'connect_premium',
  ACCOUNT_RECOVERY = 'account_recovery',
  MFA = 'mfa',
  BYOA = 'byoa',
  SESSION_MGMT = 'session_mgmt',
  LOGIN_DATA_EXPORT = 'login_data_export',
  SMTP = 'smtp',
  EMAIL_TPL = 'email_tpl',
}
