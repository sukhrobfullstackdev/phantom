import { parsePhoneNumber } from 'libphonenumber-js';

export const formatPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber) {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
    return `+${parsedPhoneNumber.countryCallingCode} ${parsedPhoneNumber.formatNational()}`;
  }
  return '';
};

export const isSetupRecoveryFlow = flow => flow === 'setup';
export const isEditRecoveryFlow = flow => flow === 'edit';
