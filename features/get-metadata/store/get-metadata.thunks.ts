import { MagicUserMetadata } from 'magic-sdk';
import { WalletType } from '~/app/constants/flags';
import { generateUserId } from '~/app/libs/generate-user-id';
import { isETHWalletType } from '~/app/libs/network';
import { AuthenticationService } from '~/app/services/authentication';
import { setUserEmail } from '~/app/store/auth/auth.actions';
import { ThunkActionWrapper } from '~/app/store/types';

export function injectedDeps(
  authService = AuthenticationService,
  isEthWallet = isETHWalletType,
  genUserId = generateUserId,
) {
  return (): ThunkActionWrapper<Promise<MagicUserMetadata>> => {
    return async (dispatch, getState) => {
      console.log('getState().Auth.userKeys.publicAddress', getState().Auth.userKeys.publicAddress);
      const publicAddress = getState().Auth.userKeys.publicAddress ?? null;
      const { userID } = getState().Auth;
      const { data } = await authService.getUser(userID, WalletType.ETH);
      const isMfaEnabled = data.auth_user_mfa_active ?? false;

      let ethPublicAddress: string | undefined;
      if (!isEthWallet()) {
        ethPublicAddress = data.public_address;
      }

      let email = getState().Auth.userEmail || null;

      /**
       * if locally stored email doesn't match what is in the database, that means
       * the email was updated on another device. Check for that here and update.
       * */
      if (data.email && email !== data.email) {
        email = data.email || null;
        dispatch(setUserEmail(data.email));
      }

      const phoneNumber = getState().Auth.userPhoneNumber || null;
      const issuer = publicAddress ? genUserId(ethPublicAddress || publicAddress) : null;
      const recoveryFactors = data.recovery_factors;

      return {
        issuer,
        publicAddress,
        email,
        isMfaEnabled,
        phoneNumber,
        recoveryFactors,
      };
    };
  };
}

export const GetMetadataThunks = {
  formatMagicUserMetadata: injectedDeps(),
};
