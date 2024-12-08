import { DecentralizedIDTokenService } from '~/app/services/decentralized-id-token';
import { testModeStore } from '~/features/test-mode/store';
import { TestModeUserID, TestModeClientID } from '../constants/auth';
import { Web3Service } from '~/app/services/web3';
import * as testModeActions from '../store/test-mode.actions';

export async function createTestDIDToken(options: {
  userKeys?: { publicAddress?: string; privateAddress?: string };
  lifespan?: number;
  attachment?: string;
}) {
  if (options.userKeys && options.userKeys.publicAddress && options.userKeys.privateAddress) {
    return DecentralizedIDTokenService.createToken({
      account: {
        privateKey: options.userKeys.privateAddress,
        address: options.userKeys.publicAddress,
      },
      subject: TestModeUserID,
      audience: TestModeClientID,
      lifespan: options.lifespan ?? 900,
      attachment: Web3Service.personalSign(options.attachment || 'none', options.userKeys.privateAddress),
      systemClockOffset: 0,
    });
  }

  testModeStore.dispatch(testModeActions.testModeLogout());
}
