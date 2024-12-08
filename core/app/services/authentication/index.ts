import { getUserInfo } from './get-user-info';
import { getUser } from './get-user';
import { loginStart } from './login-start';
import { loginVerify } from './login-verify';
import { loginStatus } from './login-status';
import { logout } from './logout';
import { syncWallet } from './sync-wallet';
import { requestAnomalyApprove } from './request-anomaly-approve';
import { requestAnomalyBlock } from './request-anomaly-block';
import { redirectLogin } from './redirect-login';
import { redirectConfirm } from './redirect-confirm';
import { trackRevealWallet } from './track-reveal-wallet';
import { getUstWithRt } from './get-ust-with-rt';

export const AuthenticationService = {
  loginStart,
  loginVerify,
  loginStatus,
  getUserInfo,
  getUser,
  logout,
  syncWallet,
  requestAnomalyApprove,
  requestAnomalyBlock,
  redirectLogin,
  redirectConfirm,
  trackRevealWallet,
  getUstWithRt,
};
