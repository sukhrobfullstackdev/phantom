import { getPayloadData, rejectPayload, resolvePayload } from '~/app/rpc/utils';
import qs from 'qs';
import {
  createStartOAuthError,
  createInvalidRedirectUrlOAuthError,
  createRedirectAllowlistRequiredOAuthError,
  sdkErrorFactories,
} from '~/app/libs/exceptions';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { GetContext, RpcMiddleware } from '~/app/rpc/types';
import { getLogger } from '~/app/libs/datadog';
import { createCryptoChallenge } from '../../libs/crypto-challenge';
import { data } from '~/app/services/web-storage/data-api';
import { OAUTH_METADATA_KEY } from '../../constants/storage';
import { shared } from '../../providers';
import { normalizeOAuthScope, oauthScopeToArray } from '../../libs/format-oauth-scope';
import { PlatformType } from '../../types/oauth-metadata';
import { store } from '~/app/store';
import { formatOAuthFields } from '../server/oauth-field-helpers';
import { OAuthService } from '../../services/client';
import { OauthV2EnabledFlagValue } from '~/app/libs/launchDarkly/launchDarklyTypes';
import { getProviderConfig } from '../../libs/provider-config';
import { RedirectAllowlistError, checkRedirectAllowlist } from '../../libs/allowlist';

type OAuthStartParams = {
  provider: string;
  redirectURI: string;
  apiKey: string;
  scope: string;
  platform: PlatformType;
  loginHint: string | undefined;
};

type OAuthStartContext = {
  provider: string;
  redirectUri: string;
  challenge?: string;
  state?: string;
  apiKey?: string;
  scope?: string;
  platform?: PlatformType;
  loginHint?: string;
  appID?: string;
  redirectID?: string;
  oauthAppID?: string;
  oauthRedirectID?: string;
  providerRedirectURI?: string;
  oauthAuthoriationURI?: string;
  useMagicServerCallback?: boolean;
  codeVerifier?: string;
};

type OAuthStartMiddleware = RpcMiddleware<[OAuthStartParams], OAuthStartContext>;

let startTime = 0;

export const getOauthStartParams: OAuthStartMiddleware = async (ctx, next) => {
  startTime = performance.now();
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
  const oauthV2Flag = LAUNCH_DARKLY_FEATURE_FLAGS['is-oauthv2-enabled'] as OauthV2EnabledFlagValue;
  const { payload } = ctx;
  const { provider, redirectURI, apiKey, scope, platform, loginHint } = payload.params?.[0] as OAuthStartParams;

  if (!oauthV2Flag.enabled || !oauthV2Flag.providers?.includes(provider)) {
    return rejectPayload(ctx.payload, sdkErrorFactories.rpc.methodNotFoundError());
  }

  ctx.provider = provider;
  ctx.redirectUri = redirectURI;
  ctx.apiKey = apiKey;
  ctx.scope = scope;
  ctx.platform = platform;
  ctx.loginHint = loginHint;

  next();
};

export const validateRedirectUrl: OAuthStartMiddleware = async (ctx, next) => {
  await handleOAuthStartErrors(ctx, async () => {
    const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
    const isRedirectAllowlistEnforcedEnabled = LAUNCH_DARKLY_FEATURE_FLAGS[
      'is-enforce-redirect-allowlist-enabled'
    ] as boolean;
    const allowListRedirectUrl = store.getState().System.accessAllowlists?.redirect_url;

    // redirect url must be in allow list
    const { redirectUrlIsValid, redirectUrlError } = checkRedirectAllowlist({
      redirectUrl: ctx.redirectUri,
      redirectAllowList: allowListRedirectUrl,
      isRequired: !store.getState().System.isLegacyRedirectEnforcement && isRedirectAllowlistEnforcedEnabled,
    });

    if (!redirectUrlIsValid) {
      switch (redirectUrlError) {
        case RedirectAllowlistError.EMPTY:
          getLogger().error('OAuth Error Redirect Allowlist Required', {
            detail: allowListRedirectUrl,
          });

          return resolvePayload(ctx.payload, {
            ...createRedirectAllowlistRequiredOAuthError(),
            provider: ctx.provider,
            redirectUrl: ctx.redirectUri,
          });

        case RedirectAllowlistError.MISMATCH:
        default:
          getLogger().error('OAuth Error InvalidRedirectUrl', {
            detail: allowListRedirectUrl,
          });

          return resolvePayload(ctx.payload, {
            ...createInvalidRedirectUrlOAuthError(),
            provider: ctx.provider,
            redirectUrl: ctx.redirectUri,
          });
      }
    }

    next();
  });
};

export const getAppDetails: OAuthStartMiddleware = async (ctx, next) => {
  await handleOAuthStartErrors(ctx, async () => {
    const { jwt } = getPayloadData(ctx.payload);
    const { app_id, id, redirect_id } = (await OAuthService.getOauthApp(ctx.provider, jwt)).data?.[0];

    ctx.oauthAppID = app_id;
    ctx.redirectID = redirect_id;
    ctx.appID = id;

    next();
  });
};

export const generatePKCE: OAuthStartMiddleware = async (ctx, next) => {
  await handleOAuthStartErrors(ctx, () => {
    const { state, codeVerifier, challenge } = createCryptoChallenge();

    ctx.state = state;
    ctx.challenge = challenge;
    ctx.codeVerifier = codeVerifier;

    next();
  });
};

export const getOauthRedirectUri: OAuthStartMiddleware = async (ctx, next) => {
  await handleOAuthStartErrors(ctx, () => {
    const providerConfig = getProviderConfig(ctx.provider);

    /**
     * useMagicServerCallback is for providers that callback with a POST request and require
     * a server pass-through to handle the authorization code response
     * */
    ctx.useMagicServerCallback = providerConfig.useMagicServerCallback && !!ctx.redirectID;

    if (ctx.useMagicServerCallback) {
      ctx.providerRedirectURI = new URL(`/v1/oauth2/${ctx.redirectID}/callback`, window.origin).href;
    } else {
      ctx.providerRedirectURI = ctx.redirectUri;
    }

    next();
  });
};

export const persistMetaData: OAuthStartMiddleware = async (ctx, next) => {
  await handleOAuthStartErrors(ctx, () => {
    data.setItem(OAUTH_METADATA_KEY, {
      codeVerifier: ctx.codeVerifier,
      state: ctx.state,
      provider: ctx.provider,
      redirectUri: ctx.providerRedirectURI,
      appID: ctx.appID,
    });

    next();
  });
};

export const buildProviderUri: OAuthStartMiddleware = async ctx => {
  await handleOAuthStartErrors(ctx, async () => {
    const providerConfig = getProviderConfig(ctx.provider);
    const fields = formatOAuthFields(
      shared.authorizationRequestFields,
      {
        appID: ctx.oauthAppID,
        redirectURI: ctx.providerRedirectURI,
        scope: normalizeOAuthScope([
          ...(providerConfig.authorization.defaultScopes || []),
          ...oauthScopeToArray(ctx.scope),
        ]),
        state: ctx.state,
        loginHint: ctx.loginHint,
        codeChallenge: ctx.challenge,
        codeChallengeMethod: 'S256',
      },

      providerConfig.authorization.defaultParams,
    );

    let oauthAuthoriationURI = new URL(`?${qs.stringify(fields)}`, providerConfig.authorization.endpoint).href;

    if (ctx.useMagicServerCallback) {
      const query = {
        magic_api_key: ctx.apiKey,
        state: ctx.state,
        redirect_uri: ctx.redirectUri,
        provider_authorization_url: oauthAuthoriationURI,
      };

      oauthAuthoriationURI = `/v2/oauth2/${ctx.provider}/start?${qs.stringify(query)}`;
    }

    const result = {
      oauthAuthoriationURI,
      useMagicServerCallback: ctx.useMagicServerCallback,
    };

    getLogger().info('OAuth start success', {
      timeToSuccess: Math.round(performance.now() - startTime),
      ...result,
    });

    return resolvePayload(ctx.payload, result);
  });
};

async function handleOAuthStartErrors(ctx: GetContext<OAuthStartMiddleware>, action: () => void | Promise<void>) {
  try {
    await action();
  } catch (err: unknown) {
    getLogger().warn('OAuth start error', {
      error: err,
      payload: ctx.payload,
    });

    await ctx.dispatch(AuthThunks.logout()).catch(() => {});
    return resolvePayload(ctx.payload, {
      ...createStartOAuthError(),
      provider: ctx.provider,
    });
  }
}
