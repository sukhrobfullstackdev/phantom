import { useRef, useState } from 'react';
import qs from 'qs';
import { useAsyncEffect } from 'usable-react';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { useSafariHack } from './useSafariHack';
import { UserThunks } from '~/app/store/user/user.thunks';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { createFailedToGenerateCredentialOAuthError } from '~/app/libs/exceptions';
import { OAuthService } from '../services/client';
import { data } from '~/app/services/web-storage/data-api';
import { RELAYER_CONFIG_CACHE } from '~/shared/constants/storage';
import { getLogger } from '~/app/libs/datadog';
import { setWalletSecretManagementInfo } from '~/app/store/system/system.actions';
import { SecretManagementStrategy } from '~/app/types/dkms-types';
import { ClientConfigService } from '~/app/services/client-config';

export const useOAuthRedirectEffect = ({ isMfaEnabled, isMfaComplete }) => {
  const { isSafariHackDone } = useSafariHack();
  const dispatch = useDispatch();
  const [errorRedirectQuery, setErrorRedirectQuery] = useState('');
  const startTime = useRef<number>(performance.now());

  // preload and cache client config
  const cacheClientConfig = async () => {
    const configRes = await ClientConfigService.retrieve();
    if (configRes.status === 'ok' && configRes.data) {
      data.setItem(RELAYER_CONFIG_CACHE, JSON.stringify(configRes.data));
      // We need wallet secret management info here because
      // hydrateActiveUser potentially creates a wallet and we
      // might be on an app who's keys are split.
      await dispatch(
        setWalletSecretManagementInfo(
          configRes?.data?.wallet_secret_management ?? {
            strategy: SecretManagementStrategy.DKMSV3,
            definition: undefined,
          },
        ),
      );
    } else {
      getLogger().warn('Could not prefetch client config for oauth flow', {
        errorCode: configRes.error_code,
        message: configRes.message,
        status: configRes.status,
      });
    }
  };

  useAsyncEffect(async () => {
    if (!isSafariHackDone) {
      return;
    }

    if (isMfaEnabled && !isMfaComplete) {
      return;
    }

    await cacheClientConfig();

    try {
      let hydrated;

      if (isMfaEnabled) {
        hydrated = await dispatch(AuthThunks.hydrateActiveUser({ allowStorage: true }));
      } else {
        hydrated = await dispatch(AuthThunks.hydrateActiveUser({ from: 'cookies', allowStorage: true }));
      }

      if (hydrated) {
        const credential = await dispatch(UserThunks.createOAuthMagicCredentialForUser());

        if (credential) {
          const response = {
            ...(await OAuthService.sendCredential(qs.stringify({ magic_credential: credential }))).data,
            isError: false,
          };

          return response;
        }
      }

      throw createFailedToGenerateCredentialOAuthError();
    } catch (e) {
      const errorQuery = qs.stringify(e);

      /**
       *  If the flow happens in a web environment:
       *
       *    - If it's an OAuth error: Then sendError will redirect and relay
       *      the error back the client in the query
       *
       *    - If it's not OAuth error or no redirect URI is present with the
       *      request: The sendError will display the error under Magic.link
       *      domain
       *
       *  If the flow happens in a mobile environment:
       *
       *    - `sendError` will resolve with 200 and the error will be
       *      displayed in the Expo WebBrowser via client-side redirect.
       */
      try {
        return { ...(await OAuthService.sendError(errorQuery)).data, isError: true };
      } catch {
        throw errorQuery;
      }
    }
  }, [isSafariHackDone, isMfaEnabled, isMfaComplete])
    .rejected(errorQuery => {
      setErrorRedirectQuery(errorQuery);
    })
    .fullfilled(result => {
      if (result) {
        if (result.isError && result.platform === 'rn') {
          setErrorRedirectQuery(result.query);
        } else {
          getLogger().info('OAuth credential creation flow success', {
            timeToSucces: startTime.current ? Math.round(performance.now() - startTime.current) : null,
            result,
          });

          window.location.href = result.redirectURI;
        }
      }
    });

  return {
    errorRedirectQuery,
  };
};
