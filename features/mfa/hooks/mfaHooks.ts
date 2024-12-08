import { useState } from 'react';
import { isServiceError } from '~/app/libs/exceptions';
import { getPayloadData } from '~/app/rpc/utils';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { MfaService } from '../services/mfa';
import { isMfaErrorCode } from '../services/mfa/mfa';
import { mfaStore } from '../store';
import { setEnableFlowMfaData, setRecoveryCodes } from '../store/mfa.actions';

const handleError = (e, setError) => {
  setError(e);
  if (isServiceError(e) && !isMfaErrorCode(e.code)) {
    e.getControlFlowError().setUIThreadError();
  }
};

export const useEnrollMfa = () => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = mfaStore.hooks.useDispatch();
  const userId = useSelector(coreState => coreState.Auth.userID);
  const mfaInfo = mfaStore.hooks.useSelector(state => state?.mfaEnrollData?.info);
  const mfaSecret = mfaStore.hooks.useSelector(state => state?.mfaEnrollData?.secret);
  const recoveryCodes = mfaStore.hooks.useSelector(state => state?.recoveryCodes);

  const startMfaEnroll = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { data } = await MfaService.startTotpEnroll(userId);
      dispatch(
        setEnableFlowMfaData({
          secret: data.secret,
          info: data.mfa_info,
        }),
      );
    } catch (e) {
      handleError(e, setError);
    } finally {
      setIsLoading(false);
    }
  };

  const finishMfaEnroll = async (totp: string) => {
    if (!userId || !mfaInfo || !mfaSecret) {
      console.info('missing mfa finish required state from store');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { data } = await MfaService.finishTotpEnroll(userId, mfaInfo, totp);
      dispatch(setRecoveryCodes(data.recovery_codes));
      return true;
    } catch (e) {
      handleError(e, setError);
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return {
    startMfaEnroll,
    finishMfaEnroll,
    mfaInfo,
    mfaSecret,
    recoveryCodes,
    isLoading,
    error,
  };
};

export const useDisableMfa = () => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const userId = useSelector(coreState => coreState.Auth.userID);

  const disableTotp = async (totp: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await MfaService.disableTotp(userId, totp);
      return true;
    } catch (e) {
      handleError(e, setError);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const disableTotpRecoveryCode = async (recovery_code: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await MfaService.disableTotpRecoveryCode(userId, recovery_code);
      return true;
    } catch (e) {
      handleError(e, setError);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    disableTotp,
    disableTotpRecoveryCode,
    isLoading,
    error,
  };
};

export const useEnforceMfa = (flowContext: string) => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const payload = useUIThreadPayload();

  const mfaVerifyTotp = async (totp: string) => {
    const jwt = payload ? getPayloadData(payload)?.jwt : undefined;
    try {
      setError(null);
      setIsLoading(true);
      return (await MfaService.mfaVerifyTotp(flowContext, totp, jwt)).data;
    } catch (e) {
      handleError(e, setError);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const mfaVerifyCodes = async (recovery_code: string) => {
    const jwt = payload ? getPayloadData(payload)?.jwt : undefined;
    try {
      setError(null);
      setIsLoading(true);
      return (await MfaService.mfaVerifyCodes(flowContext, recovery_code, jwt)).data;
    } catch (e) {
      handleError(e, setError);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    mfaVerifyTotp,
    mfaVerifyCodes,
    isLoading,
    error,
  };
};
