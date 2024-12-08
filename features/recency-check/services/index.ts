import {
  primaryFactorChallenge,
  primaryFactorStart,
  primaryFactorVerify,
  probeRecencyCheck,
} from '~/features/recency-check/services/verifyPrimaryFactorService';

export const RecencyCheckService = {
  probeRecencyCheck,
  primaryFactorStart,
  primaryFactorChallenge,
  primaryFactorVerify,
};
