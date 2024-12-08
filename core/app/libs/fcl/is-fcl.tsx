import { includes } from '../lodash-utils';

const FCL_ORIGINS = [
  'https://fcl.magic.link',
  'https://fcl.stagef.magic.link',
  'https://fcl.dev.magic.link',
  'https://fcl-wallet-provider.vercel.app',
  'http://localhost:3002',
];

export const isFCL = () => {
  const originDomain = window.location?.ancestorOrigins?.[0];
  return includes(FCL_ORIGINS, originDomain);
};

export const getFirstReferrer = () => {
  return Array.from(window.location?.ancestorOrigins).shift();
};
