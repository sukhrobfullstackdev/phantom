import { merge } from '~/app/libs/lodash-utils';
import { HttpService, withXForwardedFor } from '~/server/services/http';
import { createResponseJson } from '~/server/libs/response';
import { withFields } from '~/server/middlewares/with-fields';
import { formatOpenIDConnectUserInfo } from '~/features/oauth/libs/format-open-id-user-info';
import { OAuthService } from '../../services/server';
import { getProviderConfig } from '../../libs/provider-config';

interface GetUserInfoFields {
  provider: string;
  field_format?: 'snake_case' | 'camelCase';
}

const getUserInfoFields = withFields<GetUserInfoFields>(['provider'], ['field_format']);

/**
 * Middleware which parses the request data and attempts to gather user profile
 * information from the OAuth provider.
 */
export const oauthGetUserInfo = getUserInfoFields(data => async (req, res) => {
  const { provider, field_format } = data;
  const providerConfig = getProviderConfig(provider, 1);

  const userInfoEndpoints = providerConfig.userInfo ?? [];
  const magicApiKey = req.ext.headers['x-magic-api-key'] as any;

  const userInfoDatas = await Promise.all(
    userInfoEndpoints.map(async cfg => {
      if (cfg.endpoint === 'INTERNAL') {
        return (await OAuthService.getUser(provider, req)).data.oauth_user_metadata;
      }

      if (providerConfig.oauthVersion === 1) {
        const { app_id: oauthAppID, app_secret: oauthAppSecret } = (
          await OAuthService.getApp(provider, magicApiKey, req)
        ).data;

        return OAuthService.oauth1.oauth1UserRequest(
          provider,
          providerConfig,
          oauthAppID,
          oauthAppSecret,
          req.ext.headers.authorization!,
          cfg.endpoint,
        );
      }

      return HttpService.oauth(provider).get(cfg.endpoint, {
        headers: withXForwardedFor({ authorization: req.ext.headers.authorization }, req),
      });
    }),
  );

  const openIDConnectFormattedData = userInfoDatas.reduce((formattedData, unformattedData, i) => {
    const nextData = formatOpenIDConnectUserInfo(unformattedData, userInfoEndpoints[i], field_format ?? 'snake_case');
    return merge(formattedData, nextData);
  }, {});

  res.status(200).json(createResponseJson(openIDConnectFormattedData));
});
