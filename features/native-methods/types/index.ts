export const POST_MESSAGE_ACTIONS = {
  NFT_TRANSFER: 'nft-transfer',
} as const;

export type PostMessageActions = (typeof POST_MESSAGE_ACTIONS)[keyof typeof POST_MESSAGE_ACTIONS];

export type Message = {
  action: PostMessageActions;
};

export type NFTTransferMessage = Message & {
  txHash: string;
};
