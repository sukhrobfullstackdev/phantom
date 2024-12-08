import { getHeaders } from '~/app/libs/connect-utils';
import { HttpService } from '~/app/services/http';

export const sendSecretPhraseViewedEmail = (isUsingPrivateKey, authUserId, walletId, isMagicAuth) => {
  const endpoint = `/v1/connect/wallet/track`;
  const body = {
    event: isUsingPrivateKey ? 'private_key_reveal' : 'seed_phrase_reveal',
    auth_user_id: authUserId,
    wallet_id: walletId,
    wallet_scope: isMagicAuth ? 'magic' : 'connect',
  };
  return HttpService.magic.post<any>(endpoint, body, getHeaders()).catch(console.error);
};
