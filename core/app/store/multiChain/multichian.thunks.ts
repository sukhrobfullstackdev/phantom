import { cloneDeep, get } from '~/app/libs/lodash-utils';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { ThunkActionWrapper } from '~/app/store/types';
import { DkmsService } from '~/app/services/dkms';
import { createBridge } from '~/app/libs/ledger';
import { getWalletType } from '~/app/libs/network';

function handleLedgerPayload(payload: JsonRpcRequestPayload): ThunkActionWrapper<Promise<string | null | undefined>> {
  return async (dispatch, getState) => {
    const payloadClone = cloneDeep(payload);
    if (payloadClone.method.startsWith('mc_')) payloadClone.method = payloadClone.method.replace('mc_', '');
    if (payloadClone.method.startsWith('mwui_')) payloadClone.method = payloadClone.method.replace('mwui_', '');
    const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
    const { systemClockOffset, walletSecretMangementInfo } = getState().System;
    const privateKey = await DkmsService.reconstructWalletPk(
      userKeys,
      getWalletType(),
      walletSecretMangementInfo,
      delegatedWalletInfo,
      deviceShare,
      systemClockOffset,
    );

    const { ledgerBridge, ledgerMethodsMapping } = await createBridge();

    return get(ledgerBridge, ledgerMethodsMapping[payloadClone.method])(payloadClone, privateKey);
  };
}

export const MultiChainThunks = {
  handleLedgerPayload,
};
