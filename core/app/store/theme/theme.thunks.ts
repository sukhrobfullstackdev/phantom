import { createTheme } from '@magiclabs/ui';
import { ThunkActionWrapper } from '../types';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { CustomBrandingType, defaultTheme, getRawThemeConfigs, RawThemeConfig } from '~/app/libs/theme';
import { isValidColor } from '~/shared/libs/validators';
import { currentEndpoint } from '~/app/libs/match-endpoint';
import { setTheme } from './theme.actions';
import { ClientConfigService } from '~/app/services/client-config';
import {
  setAccessAllowlists,
  setAppScope,
  setClientFeatureFlags,
  setConfiguredAuthProviders,
  setIsEnterprise,
  setIsSecurityOtpEnabled,
  setLegacyRedirectEnforcement,
  setLoadingClientConfig,
  setWalletSecretManagementInfo,
} from '../system/system.actions';
import { mapLoginProvidersToProvenence } from '~/features/config/utils/config-utils';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { THEME_BRANDING_DEFAULT_VALUE, THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE } from '~/app/constants/theme';
import { SecretManagementStrategy } from '~/app/types/dkms-types';
import { store } from '~/app/store';

/**
 * Hydrates custom theme from `/preview` route query parameters.
 */
function hydrateThemeFromPreviewQuery(): ThunkActionWrapper<Promise<void>> {
  return async dispatch => {
    const options = getOptionsFromEndpoint(Endpoint.Client.PreviewV1);

    dispatch(
      setTheme({
        ...createTheme({
          ...defaultTheme.config,
          primaryColor: isValidColor(`#${options.color}`) ? `#${options.color}` : defaultTheme.hex.primary.base,
          type: options.themeType,
        }),

        customBrandingType: options.customBrandingType ?? defaultTheme.customBrandingType,
        logoImage: options.logoImage ?? defaultTheme.logoImage,
        appName: options.appName ?? defaultTheme.appName,
        isPreview: true,
      }),
    );
  };
}

/**
 * Hydrates custom theme from Magic API.
 */

function hydrateAppConfigFromApi(): ThunkActionWrapper<Promise<void>> {
  return async dispatch => {
    try {
      dispatch(setLoadingClientConfig(true));

      const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
      const version = LAUNCH_DARKLY_FEATURE_FLAGS['is-config-v2-enabled'] ? 'v2' : 'v1';

      const clientConfigRes = await ClientConfigService.retrieve(version, false);
      // DH: This is for the Mandrake migration.
      // Emit the result back out to the mandrake egg shell.
      // Note: this object also contains the CSPs that must be set.
      window.parent.postMessage({ msgType: 'HYDRATE_APP_CONFIG', response: clientConfigRes }, '*');

      const {
        primary_login_providers: primaryLoginProvidersToMap,
        secondary_login_providers: secondaryLoginProviders,
        social_login_providers: socialLoginProviders,
      } = clientConfigRes.data.configured_auth_providers;
      const primaryLoginProviders = mapLoginProvidersToProvenence(primaryLoginProvidersToMap);
      dispatch(setConfiguredAuthProviders({ primaryLoginProviders, secondaryLoginProviders, socialLoginProviders }));

      const theme = createTheme({
        ...defaultTheme.config,
        primaryColor: clientConfigRes.data.client_theme.button_color ?? defaultTheme.hex.primary.base,
        type: clientConfigRes.data.client_theme.theme_color ?? undefined,
      });
      dispatch(
        setTheme({
          ...theme,
          customBrandingType: clientConfigRes.data.client_theme.custom_branding_type ?? defaultTheme.customBrandingType,
          logoImage: clientConfigRes.data.client_theme.asset_uri ?? defaultTheme.logoImage,
          appName: clientConfigRes.data.client_theme.app_name ?? defaultTheme.appName,
          isPreview: false,
        }),
      );

      dispatch(setAppScope(clientConfigRes.data.product_type === 'connect' ? 'global' : 'app'));
      dispatch(setIsEnterprise(clientConfigRes.data.is_enterprise));
      dispatch(setLegacyRedirectEnforcement(clientConfigRes.data.legacy_redirect));

      dispatch(setClientFeatureFlags({ ...clientConfigRes.data.features }));

      const accessAllowlists = clientConfigRes.data.access_allowlists;
      dispatch(setAccessAllowlists(accessAllowlists));

      dispatch(
        setIsSecurityOtpEnabled(
          LAUNCH_DARKLY_FEATURE_FLAGS['is-toggle-security-otp-enabled']
            ? clientConfigRes.data.is_security_otp_enabled || false
            : true,
        ),
      );

      dispatch(
        setWalletSecretManagementInfo(
          clientConfigRes?.data?.wallet_secret_management ?? {
            strategy: SecretManagementStrategy.DKMSV3,
            definition: undefined,
          },
        ),
      );

      dispatch(setLoadingClientConfig(false));
    } catch (e) {
      dispatch(setLoadingClientConfig(false));
      getLogger().error(`Error with client config - theme.thunk`, buildMessageContext(e));
      // This endpoint sometimes fails in testopia...
      // We swallow the error so as not to break the whole app.
      // (We'd rather have custom theme break than the whole flow stop working).
    }
  };
}

/**
 * Hydrates custom theme from a `RawThemeConfig` object. This is usually encoded
 * into query parameters from Magic API.
 */
function hydrateThemeFromRawConfig(ct?: RawThemeConfig): ThunkActionWrapper<Promise<void>> {
  return async dispatch => {
    let customBrandingType = THEME_BRANDING_DEFAULT_VALUE as CustomBrandingType;
    if (ct?.show_secured_by_magic === false) {
      customBrandingType = THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE;
    } else {
      customBrandingType = ct?.custom_branding_type ?? defaultTheme.customBrandingType;
    }
    dispatch(
      setTheme({
        ...createTheme({
          ...defaultTheme.config,
          primaryColor: ct?.button_color ?? defaultTheme.hex.primary.base,
          type: ct?.theme_color ?? undefined,
        }),
        customBrandingType,
        logoImage: ct?.asset_uri ?? defaultTheme.logoImage,
        appName: ct?.app_name ?? defaultTheme.appName,
        isPreview: false,
      }),
    );
  };
}

/**
 * Bootstraps a custom theme depending on the current endpoint.
 */
function bootstrapThemeAndConfig(): ThunkActionWrapper<Promise<void>> {
  return async dispatch => {
    const route = currentEndpoint();

    switch (route) {
      case Endpoint.Client.SendV1:
      case Endpoint.Client.SendLegacy:
      case Endpoint.Client.ConfirmNFTTransferV1:
      case Endpoint.Client.ConfirmAction:
      case Endpoint.Client.ConfirmV1:
        return dispatch(ThemeThunks.hydrateAppConfigFromApi());

      case Endpoint.Client.PreviewV1:
        return dispatch(ThemeThunks.hydrateThemeFromPreviewQuery());

      default: {
        const ct = getRawThemeConfigs();
        if (ct) return dispatch(ThemeThunks.hydrateThemeFromRawConfig(ct));
        break;
      }
    }
  };
}

/**
 * Export module to stub local function stub for testing purpose
 */
export const ThemeThunks = {
  hydrateThemeFromRawConfig,
  bootstrapThemeAndConfig,
  hydrateAppConfigFromApi,
  hydrateThemeFromPreviewQuery,
};
