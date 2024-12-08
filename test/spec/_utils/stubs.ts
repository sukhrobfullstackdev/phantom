/** @deprecated please do not use this */
export function stubGetOptionsFromEndpoint(options: any) {
  // eslint-disable-next-line
  const perRouteParsers = require('~/app/libs/query-params/per-route-parsers');
  return jest.spyOn(perRouteParsers, 'getOptionsFromEndpoint').mockImplementation(() => options);
}

/** @deprecated please do not use this */
export function stubGetWalletType(walletType: string) {
  // eslint-disable-next-line
  const network = require('~/app/libs/network');
  return jest.spyOn(network, 'getWalletType').mockImplementation(() => walletType);
}

/** @deprecated please do not use this */
export function stubGetApiKey(apiKey: string) {
  // eslint-disable-next-line
  const getApiKeyExport = require('~/app/libs/api-key');
  return jest.spyOn(getApiKeyExport, 'getApiKey').mockImplementation(() => apiKey);
}

/** @deprecated please do not use this */
export function stubIsETHWalletType(mockIsWalletTypeResult: boolean) {
  // eslint-disable-next-line
  const network = require('~/app/libs/network');
  return jest.spyOn(network, 'isETHWalletType').mockImplementation(() => mockIsWalletTypeResult);
}

/** @deprecated please do not use this */
export function stubAWSServiceKmsDecrypt(encryptedPrivateKey: string) {
  // eslint-disable-next-line
  const kms = require('~/app/services/aws/kms');
  return jest
    .spyOn(kms, 'kmsDecrypt')
    .mockImplementation(() => '0x13d76043e5771a944cbad9092d1d009e078dd8dd05cd4318953327a5a52d683b');
}

/** Will return the source path re required with env mocked @deprecated please do not use this */
export function mockEnv(sourcePath: string, env: any) {
  jest.doMock('~/shared/constants/env', () => env);
  // eslint-disable-next-line
  return require(sourcePath);
}
