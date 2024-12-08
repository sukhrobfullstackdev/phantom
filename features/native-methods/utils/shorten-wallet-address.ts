export const shortenWalletAddress = (walletAddress: string, front = 2, rear = 6) => {
  return `${walletAddress.slice(0, front)}...${walletAddress.slice(-rear)}`;
};
