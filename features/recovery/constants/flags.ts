export enum RecoveryMethodType {
  PhoneNumber = 'phone_number',
  EmailAddress = 'email_address',
}

export enum VerifyAttemptState {
  STARTED = 'started',
  CHALLENGE_ISSUED = 'challenge_issued',
  VERIFIED = 'verified',
  FAILED = 'failed',
  USED = 'used',
}
