import { beginConfirm } from './begin-confirm';
import { getConfirmStatus } from './get-confirm-status';
import { completeConfirm } from './complete-confirm';
import { getConfirmPayload } from './get-confirm-payload';

export const ConfirmActionService = {
  beginConfirm,
  getConfirmPayload,
  getConfirmStatus,
  completeConfirm,
};
