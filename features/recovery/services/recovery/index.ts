import {
  recoveryFactorAttemptChallenge,
  recoveryFactorAttemptStart,
  recoveryFactorAttemptVerify,
} from './useRecoveryService';
import {
  setupRecoveryFactorChallenge,
  setupRecoveryFactorStart,
  setupRecoveryFactorVerify,
} from '~/features/recovery/services/recovery/setupRecoveryService';
import { getRecoveryFactor } from '~/features/recovery/services/recovery/getRecoveryService';
import { deleteRecoveryFactor, patchRecoveryFactor } from '~/features/recovery/services/recovery/updateRecoveryService';
import { getUnsuportedCountries } from './unsupportedCountriesService';

export const RecoveryService = {
  recoveryFactorAttemptStart,
  recoveryFactorAttemptChallenge,
  recoveryFactorAttemptVerify,
  setupRecoveryFactorStart,
  setupRecoveryFactorChallenge,
  setupRecoveryFactorVerify,
  getRecoveryFactor,
  deleteRecoveryFactor,
  patchRecoveryFactor,
  getUnsuportedCountries,
};
