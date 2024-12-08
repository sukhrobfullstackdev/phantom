export type MfaFactors = Array<{
  type: Array<'email_link' | 'totp' | 'recovery_codes' | 'public_address' | 'sms'>;
  isVerified: boolean;
}>;
export interface MfaInfoData {
  utc_timestamp_ms: number;
  login_flow_context: string;
  factors_required: MfaFactors;
  message: string;
}
