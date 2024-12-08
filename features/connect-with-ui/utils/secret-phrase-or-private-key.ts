import { store } from '~/app/store';
import { MultiChainSecretType } from '~/app/constants/ledger-support';
import { getWalletType, isETHWalletType } from '~/app/libs/network';

export const PRIVATE_KEY = 'private key';
export const SECRET_PHRASE = 'secret phrase';

export const secretPhraseOrPrivateKeyLabel = () => {
  const { activeAuthWallet } = store.getState().User;
  if (isETHWalletType()) {
    return activeAuthWallet ? PRIVATE_KEY : SECRET_PHRASE;
  }
  return MultiChainSecretType[getWalletType()];
};
