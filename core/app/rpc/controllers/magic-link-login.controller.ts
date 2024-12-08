import { trim } from '~/app/libs/lodash-utils';
import { RpcMiddleware } from '../types';
import { getPayloadData, handleHydrateUser, resolvePayload } from '../utils';
import { isValidEmail } from '~/shared/libs/validators';
import { createControlFlowError, ControlFlowErrorCode } from '~/app/libs/exceptions';
import { aliasIdentity } from '~/app/libs/analytics';
import { LoginMethodType } from '~/app/constants/flags';

// Actions & Thunks
import { SystemThunks } from '~/app/store/system/system.thunks';
import { UserThunks } from '../../store/user/user.thunks';
import { AuthThunks } from '../../store/auth/auth.thunks';
import { setUIThreadError } from '~/app/store/ui-thread/ui-thread.actions';
import { setMagicLinkLoginType } from '~/app/store/auth/auth.actions';
import { MagicLinkLoginType } from '~/app/store/auth/auth.reducer';
import { isMobileSDK } from '~/app/libs/platform';

type LoginParams = [{ email: string; showUI: boolean; redirectURI?: string; overrides?: { variation?: string } }];
type LoginContext = {
  emailNormalized?: string;
  redirectURI?: string;
  defaultTokenLifespan: number;
  isLoggedIn?: boolean;
};
type LoginMiddleware = RpcMiddleware<LoginParams, LoginContext>;

/**
 * Marshall the parameters required for the login flow.
 */
export const marshallLoginParams: LoginMiddleware = async (ctx, next) => {
  const { payload, getState, dispatch } = ctx;
  const [{ email: emailRaw, redirectURI }] = payload.params!;
  ctx.emailNormalized = trim(emailRaw);
  ctx.redirectURI = redirectURI;
  const magicLinkLoginType = redirectURI ? MagicLinkLoginType.Redirect : MagicLinkLoginType.OriginalContext;
  dispatch(setMagicLinkLoginType(magicLinkLoginType));
  const { jwt, rt } = getPayloadData(payload);
  const hydrated = await handleHydrateUser({ rt, jwt });
  const { Auth } = getState();
  ctx.isLoggedIn = hydrated && !!Auth.ust;
  next();
};

// DH: when introducing pseudo otp we will break whitelabeled clients
// We will force our UI to pop up for anyone using login with magic link
// and does not pass a redirectURI
export const checkIfShouldForceUI: LoginMiddleware = async (ctx, next) => {
  const { payload, getState } = ctx;
  const { System } = getState();
  const { isSecurityOtpEnabled } = System;
  const [{ redirectURI, email, overrides }] = payload.params!;

  if (isSecurityOtpEnabled && (!redirectURI || isMobileSDK())) {
    payload.params = [
      {
        redirectURI: isMobileSDK() ? undefined : redirectURI,
        email,
        showUI: true,
        ...(overrides && { overrides }),
      },
    ];
  }
  next();
};

/**
 * If user is logged in, resolve the payload immediately with a fresh DIDT,
 * otherwise reset authentication state and continue.
 */
export const checkIfUserIsAlreadyLoggedIn: LoginMiddleware = async (ctx, next) => {
  const { payload, getState, dispatch, emailNormalized, isLoggedIn } = ctx;
  const { Auth } = getState();

  if (isLoggedIn) {
    if (
      emailNormalized?.toLowerCase() === Auth.userEmail.toLowerCase() &&
      Auth.loginType === LoginMethodType.EmailLink
    ) {
      try {
        const token = await dispatch(UserThunks.createDIDTokenForUser(ctx.defaultTokenLifespan));
        return resolvePayload(payload, token);
      } catch {
        // We'll reach this if the user is not logged in...
      }
    }

    await dispatch(AuthThunks.logout({ shouldCallLogoutApi: false }));
  }

  next();
};

/**
 * Execute a `loginWithMagicLink` flow.
 */
export const doMagicLinkLoginFlow: LoginMiddleware = async ctx => {
  const { payload, getState, dispatch, emailNormalized, redirectURI } = ctx;
  if (!isValidEmail(emailNormalized)) throw createControlFlowError(ControlFlowErrorCode.MalformedEmail);
  await dispatch(AuthThunks.loginWithMagicLink(emailNormalized!, redirectURI, payload));

  /*
    todo (harry/#556) update this tracking userInfo when do the one iframe support multi blockchain
    When user are using different blockchain public key will be another blockchain' public key
    may confuse the tracking system
  */
  aliasIdentity({ email: getState().Auth.userEmail, userID: getState().Auth.userID });

  const token = await dispatch(UserThunks.createDIDTokenForUser(ctx.defaultTokenLifespan));

  await resolvePayload(payload, token);
};

/**
 * Retry a `loginWithMagicLink` flow. This is invoked from a "UI event," so we
 * can assume the UI thread is open.
 */
export const retryMagicLinkLoginFlow: LoginMiddleware = async ctx => {
  const { payload, getState, dispatch, emailNormalized, redirectURI } = ctx;

  dispatch(SystemThunks.emitJsonRpcEvent({ payload, event: 'retry' }));
  dispatch(setUIThreadError(undefined));
  await dispatch(AuthThunks.loginWithMagicLink(emailNormalized!, redirectURI, payload));

  /*
    todo (harry/#556) update this tracking userInfo when do the one iframe support multi blockchain
    When user are using different blockchain public key will be another blockchain' public key
    may confuse the tracking system
  */
  aliasIdentity({ email: getState().Auth.userEmail, userID: getState().Auth.userID });

  const token = await dispatch(UserThunks.createDIDTokenForUser(ctx.defaultTokenLifespan));

  await resolvePayload(payload, token);
};
