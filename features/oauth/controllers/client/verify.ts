import { GetContext, RpcMiddleware, RpcMiddlewareContext } from '~/app/rpc/types';
import { getPayloadData, handleHydrateUserOrReject, resolvePayload } from '~/app/rpc/utils';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { createVerifyOAuthError, createStateMismatchOAuthError } from '~/app/libs/exceptions';
import { data } from '~/app/services/web-storage/data-api';
import { OAUTH_METADATA_KEY } from '../../constants/storage';
import { shared } from '../../providers';
import { parseOAuthFields } from '../../libs/oauth-helpers';
import {
  setLoginFactorsRequired,
  setLoginFlowContext,
  setOauthMfaContext,
  setRT,
  setUST,
  setUserEmail,
  setUserID,
} from '~/app/store/auth/auth.actions';

import { UserThunks } from '~/app/store/user/user.thunks';
import { OAuthService } from '../../services/client';
import { GetMetadataThunks } from '~/features/get-metadata/store/get-metadata.thunks';
import { oauthScopeToArray } from '../../libs/format-oauth-scope';
import { getLogger } from '~/app/libs/datadog';
import { OpenIDConnectUserInfo } from '../../types/open-id-connect';
import { camelizeSnakeKeys } from '~/shared/libs/object-helpers';
import { showUI } from '~/app/rpc/controllers/ui.controller';

export type OAuthVerifyParams = [
  {
    authorizationResponseParams: string;
    magicApiKey: string;
    platform: string;
  },
];

type OAuthVerifyContext = {
  oauthParsedQuery?: {
    state?: string;
    scope?: string;
    authorizationCode?: string;
    authuser?: string;
    hd?: string;
    prompt?: string;
    idToken?: string;
    error?: string;
    errorDescription?: string;
    errorURI?: string;
    user?: string;
  };
  provider?: string;
  codeVerifier?: string;
  originalState?: string;
  magicApiKey: string;
  platform: string;
  redirectUri: string;
  oauthAccessToken: string;
  oauthUserHandle: string;
  userInfo: OpenIDConnectUserInfo<'camelCase'>;
  appID: string;
  accessToken?: string;
  mfaEnabled: boolean;
};

type OAuthVerifyMiddleware = RpcMiddleware<OAuthVerifyParams, OAuthVerifyContext>;

let startTime = 0;

/**
 * Marshall the parameters required to parse OAuth results.
 */
export const marshallParseOAuthResultParams: OAuthVerifyMiddleware = async (ctx, next) => {
  await handleOAuthVerifyErrors(ctx, async () => {
    startTime = performance.now();
    const { payload } = ctx;
    const { authorizationResponseParams, magicApiKey, platform } = (payload.params as OAuthVerifyParams)[0];

    ctx.oauthParsedQuery = parseOAuthFields(authorizationResponseParams, shared.authorizationResponseFields);
    ctx.magicApiKey = magicApiKey;
    ctx.platform = platform;

    // Quickly resolve errors found on the parsed query.
    if ((ctx.oauthParsedQuery as any).error) {
      return resolvePayload(payload, ctx.oauthParsedQuery);
    }
  });

  next();
};

/**
 * Retrieve the OAuth metadata from storage.
 */
export const getStorageMetadata: OAuthVerifyMiddleware = async (ctx, next) => {
  await handleOAuthVerifyErrors(ctx, async () => {
    const { state, codeVerifier, provider, redirectUri, appID } = await data.getItem(OAUTH_METADATA_KEY);

    ctx.originalState = state;
    ctx.codeVerifier = codeVerifier;
    ctx.provider = provider;
    ctx.redirectUri = redirectUri;
    ctx.appID = appID;

    data.removeItem(OAUTH_METADATA_KEY);
  });

  next();
};

/**
 * Compare the OAuth state to the original state.
 */
export const compareOAuthState: OAuthVerifyMiddleware = async (ctx, next) => {
  await handleOAuthVerifyErrors(ctx, async () => {
    const { payload, oauthParsedQuery, originalState } = ctx;
    if (!originalState || originalState !== oauthParsedQuery?.state) {
      return resolvePayload(payload, {
        ...createStateMismatchOAuthError(),
        provider: ctx.provider,
      });
    }
  });

  next();
};

/**
 * Retrieve the OAuth session token, refresh token, and user info.
 */
export const getToken: OAuthVerifyMiddleware = async (ctx, next) => {
  await handleOAuthVerifyErrors(ctx, async () => {
    const { payload, oauthParsedQuery, codeVerifier, appID, redirectUri, dispatch } = ctx;
    const { authorizationCode } = oauthParsedQuery || {};
    const { jwt } = getPayloadData(payload);

    const res = await OAuthService.verifyOauth({
      appID,
      authorizationCode: authorizationCode || '',
      codeVerifier: codeVerifier || '',
      redirectURI: redirectUri,
      jwt,
    });

    const {
      auth_user_id: authUserId,
      auth_user_session_token: sessionToken,
      refresh_token: refreshToken,
      login_flow_context: loginFlowContext,
      factors_required: factorsRequired,
      oauth_access_token: accessToken,
      user_info: userInfo,
    } = res.data;

    ctx.mfaEnabled = !!factorsRequired && !!loginFlowContext;
    ctx.userInfo = camelizeSnakeKeys(userInfo);
    ctx.accessToken = accessToken;

    if (ctx.mfaEnabled) {
      const voidCtx: RpcMiddlewareContext = ctx as any;

      dispatch(
        setOauthMfaContext({
          userInfo: ctx.userInfo,
          provider: ctx.provider || '',
          scope: oauthScopeToArray(oauthParsedQuery?.scope),
          userHandle: authUserId,
          payload,
        }),
      );

      dispatch(setLoginFactorsRequired(factorsRequired));
      dispatch(setLoginFlowContext(loginFlowContext || ''));

      await showUI.force(voidCtx, next);
      return;
    }

    if (refreshToken) {
      dispatch(setRT(refreshToken));
    }

    dispatch(setUserID(authUserId));
    dispatch(setUST(sessionToken));

    ctx.oauthUserHandle = authUserId;

    await handleHydrateUserOrReject();
  });

  next();
};

export const resolveOAuthFlow: OAuthVerifyMiddleware = async ctx => {
  await handleOAuthVerifyErrors(ctx, async () => {
    const { payload, dispatch, oauthParsedQuery, oauthUserHandle, userInfo, mfaEnabled } = ctx;

    if (mfaEnabled) return;

    const lifespan = 15 * 60; // 15 minutes
    const idToken = await dispatch(UserThunks.createDIDTokenForUser(lifespan));
    const isEmailVerified = userInfo.emailVerified ?? true;

    dispatch(setUserEmail((isEmailVerified && userInfo.email) || null));
    const userMetadata = await dispatch(GetMetadataThunks.formatMagicUserMetadata());

    const result = {
      oauth: {
        provider: ctx.provider,
        scope: oauthScopeToArray(oauthParsedQuery?.scope),
        accessToken: ctx.accessToken,
        userHandle: oauthUserHandle,
        userInfo,
      },
      magic: {
        idToken,
        userMetadata,
      },
    };

    getLogger().info('OAuth verify success', {
      timeToSuccess: Math.round(performance.now() - startTime),
      result,
      payload,
    });

    return resolvePayload(payload, result);
  });
};

async function handleOAuthVerifyErrors(ctx: GetContext<OAuthVerifyMiddleware>, action: () => void | Promise<void>) {
  try {
    await action();
  } catch (err: unknown) {
    getLogger().warn('OAuth verify error', {
      error: err,
      payload: ctx.payload,
    });

    await ctx.dispatch(AuthThunks.logout()).catch(() => {});
    return resolvePayload(ctx.payload, {
      ...createVerifyOAuthError(),
      provider: ctx.provider,
    });
  }
}
