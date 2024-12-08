import { RpcMiddleware, GetContext } from '~/app/rpc/types';
import { resolvePayload, handleHydrateUserOrReject, getPayloadData } from '~/app/rpc/utils';
import { getParsedQueryParams } from '~/app/libs/query-params';
import { OAuthService } from '../../services/client';
import { createStateMismatchOAuthError, createAccessTokenRetrieveOAuthError } from '~/app/libs/exceptions';
import { oauthScopeToArray } from '~/features/oauth/libs/format-oauth-scope';

// Actions & Thunks
import { setUST, setUserID, setUserEmail, setRT } from '~/app/store/auth/auth.actions';
import { UserThunks } from '~/app/store/user/user.thunks';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { GetMetadataThunks } from '~/features/get-metadata/store/get-metadata.thunks';
import { getLogger } from '~/app/libs/datadog';

type OAuthRedirectParams = [string, string, string]; // [queryString, verifier, state]
type OAuthRedirectContext = {
  oauthParsedQuery?: {
    provider?: string;
    state?: string;
    scope?: string;
    magic_oauth_request_id?: string;
    magic_credential?: string;
  };
  oauthMagicVerifier?: string;
  oauthOriginalState?: string;
  oauthAccessToken?: string;
  oauthUserHandle?: string;
};
type OAuthRedirectMiddleware = RpcMiddleware<OAuthRedirectParams, OAuthRedirectContext>;

let startTime = 0;
/**
 * Marshall the parameters required to parse OAuth results.
 */
export const marshallParseOAuthResultParams: OAuthRedirectMiddleware = async (ctx, next) => {
  await handleOAuthRedirectErrors(ctx, async () => {
    startTime = performance.now();
    const { payload } = ctx;
    const [queryString, verifier, state] = payload.params as OAuthRedirectParams;

    ctx.oauthParsedQuery = getParsedQueryParams(queryString.substr(1));
    ctx.oauthMagicVerifier = verifier;
    ctx.oauthOriginalState = state;

    // Quickly resolve errors found on the parsed query.
    if ((ctx.oauthParsedQuery as any).error) {
      return resolvePayload(payload, ctx.oauthParsedQuery);
    }
  });

  next();
};

/**
 * Compare state parameters given by the result query and the developer
 * application cache. If the state parameter mismatches, the result must be
 * rejected.
 */
export const compareOAuthState: OAuthRedirectMiddleware = async (ctx, next) => {
  const { payload, oauthParsedQuery, oauthOriginalState } = ctx;

  if (oauthOriginalState !== oauthParsedQuery?.state) {
    return resolvePayload(payload, {
      ...createStateMismatchOAuthError(),
      provider: oauthParsedQuery?.provider,
    });
  }

  next();
};

/**
 * Retrieve the OAuth access token + Auth Relayer UST + auth user info.
 */
export const getOAuthAccessToken: OAuthRedirectMiddleware = async (ctx, next) => {
  await handleOAuthRedirectErrors(ctx, async () => {
    const { dispatch, oauthParsedQuery, oauthMagicVerifier, payload } = ctx;
    const { jwt } = getPayloadData(payload);
    const {
      auth_user_id,
      auth_user_session_token,
      access_token: oauth_access_token,
      provider_user_handle,
      refresh_token,
    } = (
      await OAuthService.getAccessToken(
        oauthParsedQuery?.magic_oauth_request_id!,
        oauthMagicVerifier!,
        oauthParsedQuery?.magic_credential!,
        jwt,
      )
    ).data;

    if (refresh_token) {
      dispatch(setRT(refresh_token));
    }

    dispatch(setUserID(auth_user_id));
    dispatch(setUST(auth_user_session_token));

    // non-blocking promise as it is not a dependency
    dispatch(AuthThunks.persistSessionCookies(oauthMagicVerifier!));

    await handleHydrateUserOrReject();

    ctx.oauthAccessToken = oauth_access_token;
    ctx.oauthUserHandle = provider_user_handle;
  });

  next();
};

/**
 * Generate a DID token for the authenticated user, retrieve user metadata, and
 * resolve the final OAuth redirect result!
 */
export const resolveOAuthFlow: OAuthRedirectMiddleware = async ctx => {
  await handleOAuthRedirectErrors(ctx, async () => {
    const { payload, dispatch, oauthParsedQuery, oauthAccessToken, oauthUserHandle } = ctx;

    const lifespan = 15 * 60; // 15 minutes as seconds
    const idToken = await dispatch(UserThunks.createDIDTokenForUser(lifespan));
    const authorization = oauthParsedQuery?.provider === 'apple' ? idToken : oauthAccessToken;
    const oauthUserInfo = (await OAuthService.getUserInfo(oauthParsedQuery?.provider!, authorization!)).data;
    const isEmailVerified = oauthUserInfo.emailVerified ?? true; // assume `true` if `emailVerified` is null/undefined
    dispatch(setUserEmail((isEmailVerified && oauthUserInfo.email) || null));
    const userMetadata = await dispatch(GetMetadataThunks.formatMagicUserMetadata());

    const result = {
      oauth: {
        provider: oauthParsedQuery?.provider,
        scope: oauthScopeToArray(oauthParsedQuery?.scope),
        accessToken: oauthAccessToken,
        userHandle: oauthUserHandle,
        userInfo: oauthUserInfo,
      },
      magic: {
        idToken,
        userMetadata,
      },
    };

    getLogger().info('OAuth resolution success', {
      timeToSucces: Math.round(performance.now() - startTime),
      result,
      payload,
    });

    return resolvePayload(payload, result);
  });
};

async function handleOAuthRedirectErrors(ctx: GetContext<OAuthRedirectMiddleware>, action: () => void | Promise<void>) {
  try {
    await action();
  } catch {
    await ctx.dispatch(AuthThunks.logout()).catch(() => {});
    return resolvePayload(ctx.payload, {
      ...createAccessTokenRetrieveOAuthError(),
      provider: ctx.oauthParsedQuery?.provider,
    });
  }
}
