export const signTypedDataV1Payload = [
  {
    type: 'string',
    name: 'Hello from Portis',
    value: 'This message will be signed by you',
  },
  {
    type: 'uint32',
    name: 'Here is a number',
    value: '90210',
  },
];

export const signTypedDataV3Payload = {
  types: {
    EIP712Domain: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'version',
        type: 'string',
      },
      {
        name: 'verifyingContract',
        type: 'address',
      },
    ],
    Order: [
      {
        name: 'makerAddress',
        type: 'address',
      },
      {
        name: 'takerAddress',
        type: 'address',
      },
      {
        name: 'feeRecipientAddress',
        type: 'address',
      },
      {
        name: 'senderAddress',
        type: 'address',
      },
      {
        name: 'makerAssetAmount',
        type: 'uint256',
      },
      {
        name: 'takerAssetAmount',
        type: 'uint256',
      },
      {
        name: 'makerFee',
        type: 'uint256',
      },
      {
        name: 'takerFee',
        type: 'uint256',
      },
      {
        name: 'expirationTimeSeconds',
        type: 'uint256',
      },
      {
        name: 'salt',
        type: 'uint256',
      },
      {
        name: 'makerAssetData',
        type: 'bytes',
      },
      {
        name: 'takerAssetData',
        type: 'bytes',
      },
    ],
  },
  domain: {
    name: '0x Protocol',
    version: '2',
    verifyingContract: '0x35dd2932454449b14cee11a94d3674a936d5d7b2',
  },
  message: {
    exchangeAddress: '0x35dd2932454449b14cee11a94d3674a936d5d7b2',
    senderAddress: '0x0000000000000000000000000000000000000000',
    makerAddress: '0x338be8514c1397e8f3806054e088b2daf1071fcd',
    takerAddress: '0x0000000000000000000000000000000000000000',
    makerFee: '0',
    takerFee: '0',
    makerAssetAmount: '97500000000000',
    takerAssetAmount: '15000000000000000',
    makerAssetData: '0xf47261b0000000000000000000000000d0a1e359811322d97991e03f863a0c30c2cf029c',
    takerAssetData: '0xf47261b00000000000000000000000006ff6c0ff1d68b964901f986d4c9fa3ac68346570',
    salt: '1553722433685',
    feeRecipientAddress: '0xa258b39954cef5cb142fd567a46cddb31a670124',
    expirationTimeSeconds: '1553808833',
  },
  primaryType: 'Order',
};

export const signTypedDataV4Payload = {
  domain: {
    chainId: 1,
    name: 'Ether Mail',
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    version: '1',
  },
  message: {
    contents: 'Hello, Bob!',
    from: {
      name: 'Cow',
      wallets: ['0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'],
    },
    to: [
      {
        name: 'Bob',
        wallets: [
          '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
          '0xB0B0b0b0b0b0B000000000000000000000000000',
        ],
      },
    ],
  },
  primaryType: 'Mail',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Group: [
      { name: 'name', type: 'string' },
      { name: 'members', type: 'Person[]' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person[]' },
      { name: 'contents', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallets', type: 'address[]' },
    ],
  },
};
