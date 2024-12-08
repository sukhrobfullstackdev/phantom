import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'alchemy-sdk';
import { getWalletType } from '~/app/libs/network';
import { getUserInfo } from '~/app/services/authentication/get-user-info';
import { DkmsService } from '~/app/services/dkms';
import { store } from '~/app/store';
import { getLogger } from '~/app/libs/datadog';
import { getUserKeysFromUserInfo } from '~/app/libs/get-user-keys-from-user-info';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';

export const useWalletForEVM = () => {
  const { alchemy } = useAlchemy();

  const { data: wallet, ...rest } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      if (!alchemy) {
        getLogger().warn('Warning with useEVMWallet:  Alchemy is not initialized');
        return null;
      }

      const { userID, delegatedWalletInfo, deviceShare } = store.getState().Auth;
      const { systemClockOffset, walletSecretMangementInfo } = store.getState().System;
      const walletType = getWalletType();

      const userInfo = await getUserInfo(userID, walletType);
      const userKeys = getUserKeysFromUserInfo(userInfo.data);

      const rawKey = await DkmsService.reconstructWalletPk(
        userKeys,
        getWalletType(),
        walletSecretMangementInfo,
        delegatedWalletInfo,
        deviceShare,
        systemClockOffset,
      );
      return new Wallet(rawKey, alchemy);
    },
    suspense: true,
  });

  return { wallet, ...rest };
};
