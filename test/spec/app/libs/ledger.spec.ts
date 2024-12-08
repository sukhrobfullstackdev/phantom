import sinon from 'sinon';
import { WalletType } from '~/app/constants/flags';
import { createBridge } from '~/app/libs/ledger';
import { has } from '~/app/libs/lodash-utils';
import { getChainId, getLedgerNodeUrl, getWalletExtensionOptions, getWalletType } from '~/app/libs/network';
import { AuthenticationService } from '~/app/services/authentication';

const mockPublicAddress = 'mock public address';

const stubAuthenticationService = public_address => {
  const stubAuthenticationServiceFun = sinon.stub();
  (AuthenticationService.getUser as any) = stubAuthenticationServiceFun;
  stubAuthenticationServiceFun.returns({
    data: {
      public_address,
    },
  });
};

const stubGetWalletType = walletType => {
  const stubGetWalletTypeFun = sinon.stub();
  (getWalletType as any) = stubGetWalletTypeFun;
  stubGetWalletTypeFun.returns(walletType);
};

const stubGetLedgerNodeUrl = () => {
  const stubGetLedgerNodeUrlFun = sinon.stub();
  (getLedgerNodeUrl as any) = stubGetLedgerNodeUrlFun;
  stubGetLedgerNodeUrlFun.returns('https://localhost:3011/');
};

const stubGetChainId = () => {
  const stubGetChainIdFun = sinon.stub();
  (getChainId as any) = stubGetChainIdFun;
  stubGetChainIdFun.returns(1);
};

const stubGetWalletExtensionOptions = () => {
  const stubGetWalletExtensionOptionsFun = sinon.stub();
  (getWalletExtensionOptions as any) = stubGetWalletExtensionOptionsFun;
  stubGetWalletExtensionOptionsFun.returns(null);
};

const stubAllLedgerFunctions = () => {
  stubAuthenticationService(mockPublicAddress);
  stubGetLedgerNodeUrl();
  stubGetChainId();
  stubGetWalletExtensionOptions();
};

test(`createBridge success`, async () => {
  stubAllLedgerFunctions();
  stubGetWalletType(WalletType.NEAR);

  const result = await createBridge();

  expect(has(result, 'ledgerMethodsMapping')).toBe(true);
  expect(has(result, 'ledgerBridge')).toBe(true);
});

test('ledgerGetAccounts success', async () => {
  stubAllLedgerFunctions();
  stubGetWalletType(WalletType.NEAR);
  const bridge = await createBridge();
  const result = await bridge.ledgerBridge.getAccount();

  expect(result).toEqual(mockPublicAddress);
});
