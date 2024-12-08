import NftLoadingImageDark from '~/shared/svg/nft/nft-loading-image-dark.svg';
import NftLoadingImage from '~/shared/svg/nft/nft-loading-image.svg';
import { store } from '~/app/store';

export const getNftImage = (imageSrc: string | undefined) => {
  const { isDarkTheme } = store.getState().Theme.theme;
  if (!imageSrc) return isDarkTheme ? NftLoadingImageDark : NftLoadingImage;
  if (!imageSrc.startsWith('ipfs')) return imageSrc;
  return imageSrc.replace('ipfs://', 'https://ipfs.io/ipfs/');
};
