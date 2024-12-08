import { buildForwardPayload } from './build-forward-payload';
import { getRequestState } from './get-request-state';
import { submitGaslessRequest } from './submit-gasless-request';

export const GasService = {
  buildForwardPayload,
  submitGaslessRequest,
  getRequestState,
};
