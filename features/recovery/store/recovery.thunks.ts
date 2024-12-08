import { ThunkActionWrapper } from '~/app/store/types';
import { Recovery } from '~/features/recovery/store/recovery.reducer';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { RecoveryService } from '~/features/recovery/services/recovery';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import { recoveryStore } from '~/features/recovery/store/index';
import {
  setCurrentFactorId,
  setCurrentFactorValue,
  setPrimaryFactorToRecover,
} from '~/features/recovery/store/recovery.actions';
import { store } from '~/app/store';

export function rejectNoRecoveryMethod(email: string): ThunkActionWrapper<Promise<void>, typeof Recovery> {
  return async () => {
    const recoveryFactorList = (await RecoveryService.recoveryFactorAttemptStart(email)).data;

    const activeSmsRecoveryFactor = recoveryFactorList.find(f => f.type === RecoveryMethodType.PhoneNumber);

    if (!activeSmsRecoveryFactor) {
      throw sdkErrorFactories.rpc.invalidRequestError('No recovery methods found.');
    }

    const { factor_id, value } = activeSmsRecoveryFactor;
    recoveryStore.dispatch(setPrimaryFactorToRecover(email));
    recoveryStore.dispatch(setCurrentFactorId(factor_id));
    recoveryStore.dispatch(setCurrentFactorValue(value));
  };
}

export function checkIfUserIsLoggedIn(): ThunkActionWrapper<Promise<void>, typeof Recovery> {
  return async () => {
    const { Auth } = store.getState();
    if (Auth.ust) {
      throw sdkErrorFactories.rpc.invalidRequestError('User is already Logged in, No need to recover.');
    } // comment it in whitelabel
  };
}

export function checkRecoveryFactor(): ThunkActionWrapper<Promise<void>, typeof Recovery> {
  return async () => {
    const { Auth } = store.getState();

    const recoveryFactorList = (await RecoveryService.getRecoveryFactor(Auth.userID)).data;
    const activePhoneNumberRecoveryFactor = recoveryFactorList.find(
      factor => factor.type === RecoveryMethodType.PhoneNumber && factor.is_active,
    );

    if (activePhoneNumberRecoveryFactor) {
      recoveryStore.dispatch(setCurrentFactorId(activePhoneNumberRecoveryFactor.id));
      recoveryStore.dispatch(setCurrentFactorValue(activePhoneNumberRecoveryFactor.value));
    }
  };
}
