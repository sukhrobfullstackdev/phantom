import { authorizePaypalOrder } from './authorizePaypalOrder';
import { capturePaypalOrder } from './capturePaypalOrder';
import { createPaypalOrder } from './createPaypalOrder';
import { fetchPaypalClientToken } from './fetchPaypalClientToken';
import { fetchRequestStatus } from './fetchRequestStatus';
import { fetchTokenInfo } from './fetchTokenInfo';

export const NFTService = {
  authorizePaypalOrder,
  capturePaypalOrder,
  createPaypalOrder,
  fetchPaypalClientToken,
  fetchRequestStatus,
  fetchTokenInfo,
};
