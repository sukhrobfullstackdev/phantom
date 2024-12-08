export enum ClientEndpoint {
  SendV1 = '/send',
  SendLegacy = '/send-legacy',
  ConfirmV1 = '/confirm',
  LoginV1 = '/login',
  PreviewV1 = '/preview/:id',
  ConfirmEmailV1 = '/confirm-email/:type',
  ErrorV1 = '/error',
  NewDeviceV1 = '/v1/new-device-verification',
  ConfirmNFTTransferV1 = '/v1/confirm-nft-transfer',
  ConfirmAction = '/confirm-action',
}
