import qs from 'qs';
import { RpcMiddleware } from '../types';
import { getPayloadData, resolvePayload } from '../utils';
import { aliasIdentity } from '~/app/libs/analytics';

// Actions & Thunks
import { AuthThunks } from '../../store/auth/auth.thunks';
import { UserThunks } from '../../store/user/user.thunks';

type CredentialLoginParams = [string];
type CredentialLoginContext = {
  credential?: string;
  defaultTokenLifespan: number;
};
type CredentialLoginMiddleware = RpcMiddleware<CredentialLoginParams, CredentialLoginContext>;

/**
 * Marshall the parameters required for the credential login flow.
 */
export const marshallCredentialLoginParams: CredentialLoginMiddleware = async (ctx, next) => {
  const { payload } = ctx;
  const [credentialOrQuery] = payload.params as CredentialLoginParams;

  try {
    const maybeCredential = qs.parse(credentialOrQuery.substr(1)).magic_credential as string | undefined;
    ctx.credential = maybeCredential ?? credentialOrQuery ?? '';
  } catch {
    ctx.credential = credentialOrQuery ?? '';
  }

  next();
};

/**
 * Trade the `magic_credential` for a fully-privileged user session.
 */
export const verifyMagicCredential: CredentialLoginMiddleware = async ctx => {
  const { payload, getState, dispatch, credential } = ctx;

  const { jwt } = getPayloadData(payload);
  await dispatch(AuthThunks.loginWithCredential(credential!, jwt));

  /*
    todo (harry/#556) update this tracking userInfo when do the one iframe support multi blockchain
    When user are using different blockchain public key will be another blockchain' public key
    may confuse the tracking system
  */
  aliasIdentity({ email: getState().Auth.userEmail, userID: getState().Auth.userID });

  const token = await dispatch(UserThunks.createDIDTokenForUser(ctx.defaultTokenLifespan));

  await resolvePayload(payload, token);
};
