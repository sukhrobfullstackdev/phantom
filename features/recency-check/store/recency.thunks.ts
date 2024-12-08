import { ThunkActionWrapper } from '~/app/store/types';
import { store } from '~/app/store';
import { RecencyCheckService } from '~/features/recency-check/services';
import { recoveryStore } from '~/features/recovery/store';
import { recencyStore } from '~/features/recency-check/store/index';
import {
  initRecencyCheck,
  setDestinationAfterVerified,
  setNeedPrimaryFactorVerification,
} from '~/features/recency-check/store/recency.actions';
import { DeepLinkPage } from 'magic-sdk';
import { RecencyReducer } from '~/features/recency-check/store/recency.reducer';

function probeRecency(returnPage: string): ThunkActionWrapper<Promise<void>, typeof RecencyReducer> {
  return async () => {
    recencyStore.dispatch(initRecencyCheck());
    const { userID, userEmail } = store.getState().Auth;
    const { currentFactorId } = recoveryStore.getState();

    let destPage = '';
    switch (returnPage) {
      case DeepLinkPage.Recovery:
        destPage = currentFactorId ? 'edit-phone-number' : 'add-phone-number';
        break;
      case DeepLinkPage.UpdateEmail:
        destPage = 'update-email-input-address';
        break;
    }

    try {
      recencyStore.dispatch(setDestinationAfterVerified(destPage));
      await RecencyCheckService.probeRecencyCheck(userID, userEmail);
      recencyStore.dispatch(setNeedPrimaryFactorVerification(false));
    } catch (e) {
      recencyStore.dispatch(setNeedPrimaryFactorVerification(true));
    }
  };
}

export const RecencyThunks = {
  probeRecency,
};
