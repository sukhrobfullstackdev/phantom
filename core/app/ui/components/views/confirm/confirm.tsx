import React from 'react';
import { useAsyncEffect, useTimer, useTimerComplete } from 'usable-react';
import { AuthSuccess } from '../../partials/auth-confirm-states/auth-success';
import { AuthPending } from '../../partials/auth-confirm-states/auth-pending';
import { useTheme } from '../../../hooks/use-theme';
import { useController } from '../../../hooks/use-controller';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { AuthExpired } from '../../partials/auth-confirm-states/auth-expired';
import { AuthFailed } from '../../partials/auth-confirm-states/auth-failed';
import { AuthenticationService } from '../../../../services/authentication';
import { getOptionsFromEndpoint, getParsedQueryParams, getRawOptions } from '../../../../libs/query-params';
import { aliasIdentity } from '~/app/libs/analytics';
import { ControlFlowErrorCode, resolveErrorCode, ServiceError } from '~/app/libs/exceptions';
import { AuthAnomalyDetected } from '../../partials/auth-confirm-states/auth-anomaly-detected';
import { Endpoint } from '~/server/routes/endpoint';
import { i18n } from '~/app/libs/i18n';
import { wait } from '~/shared/libs/wait';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { initAuthState } from '../../../../store/auth/auth.actions';
import { AuthLinkBroken } from '../../partials/auth-confirm-states/auth-link-broken';
import { decodeJWT } from '~/shared/libs/decode-jwt';
import { decodeBase64URL } from '~/app/libs/base64';

// Actions & Thunks
import { UserThunks } from '../../../../store/user/user.thunks';
import { AuthThunks } from '../../../../store/auth/auth.thunks';
import { Modal } from '../../layout/modal';
import { StandardPage } from '../../layout/standard-page';
import { AuthDifferentIp } from '../../partials/auth-confirm-states/auth-different-ip';
import { AuthInvalidRedirect } from '../../partials/auth-confirm-states/auth-invalid-redirect';
import { AuthSecurityOtpChallenge } from '../../partials/auth-confirm-states/auth-security-otp-challenge';
import { AuthSecurityOtpExpired } from '../../partials/auth-confirm-states/auth-security-otp-expired/auth-security-otp-expired';

import { store } from '~/app/store';
import { ClientConfigService } from '~/app/services/client-config';
import { checkRedirectAllowlist } from '~/features/oauth/libs/allowlist';

function useMagicLinkConfirmation() {
  const dispatch = useDispatch();
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);

  const { theme, isDefaultTheme } = useTheme();
  useDocumentTitle(
    isDefaultTheme('appName')
      ? i18n.login.confirming_your_login.toString()
      : i18n.login.appname_confirming_your_login.toString({ appName: theme.appName }),
  );

  const { page, navigateTo, isPageActive } = useController(
    [
      { id: 'auth-pending', content: <AuthPending /> },
      { id: 'auth-security-otp-challenge', content: <AuthSecurityOtpChallenge /> },
      { id: 'auth-success', content: <AuthSuccess /> },
      { id: 'auth-expired', content: <AuthExpired /> },
      { id: 'auth-link-broken', content: <AuthLinkBroken /> },
      { id: 'auth-different-ip', content: <AuthDifferentIp /> },
      { id: 'auth-failed', content: <AuthFailed /> },
      { id: 'auth-security-otp-expired', content: <AuthSecurityOtpExpired /> },
      { id: 'auth-anomaly-detected', content: <AuthAnomalyDetected /> },
      { id: 'auth-redirect-failed', content: <AuthInvalidRedirect /> },
    ],
    { shouldAnimate: false },
  );

  const loadingTimer = useTimer({ length: 1000, tick: 1000, autoStart: true });
  const timedOutTimer = useTimer({ length: 30000, tick: 1000, autoStart: true });

  useAsyncEffect(async (context: { redirect_url?: string }) => {
    if (isMagicLinkProbablyBroken()) {
      return navigateTo('auth-link-broken');
    }
    const {
      tlt: tempLoginToken,
      e: env,
      uid,
      redirect_url,
      flow_context,
    } = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);

    /**
     * We sign the `temporary_auth_token` encoded into the `tempLoginToken` JWT
     * payload. This field is persisted in the API, so we can use it to uniquely
     * associate the `magic_credential` to the current login request.
     */
    const tempAuthToken = decodeJWT<{ temporary_auth_token: string }>(tempLoginToken!, decodeBase64URL).payload
      .temporary_auth_token;

    if (redirect_url) {
      context.redirect_url = redirect_url;
      if (LAUNCH_DARKLY_FEATURE_FLAGS['is-redirect-allowlist-enabled']) {
        const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
        const version = LAUNCH_DARKLY_FEATURE_FLAGS['is-config-v2-enabled'] ? 'v2' : 'v1';

        const { data } = await ClientConfigService.retrieve(version);
        const redirectUrlWithoutQueryParams = context.redirect_url.split('?')[0];
        const redirectAllowList = data.access_allowlists.redirect_url ?? [];

        const { redirectUrlIsValid } = checkRedirectAllowlist({
          redirectUrl: redirectUrlWithoutQueryParams,
          redirectAllowList,
        });
        // Only throw error if the allowlists.redirect_url is not empty & redirectUrl is not included
        if (!redirectUrlIsValid) {
          return navigateTo('auth-redirect-failed');
        }
      }
      await dispatch(AuthThunks.hydrateUserSessionFromRedirectConfirm(tempLoginToken, flow_context, env));
      const [credentialResult] = await Promise.allSettled([
        dispatch(UserThunks.createOAuthMagicCredentialForUser(tempAuthToken)),
        wait(600),
      ]);
      if (credentialResult.status === 'fulfilled' && !!credentialResult.value) {
        await AuthenticationService.loginVerify(tempLoginToken, env);
        return credentialResult.value;
      }
    } else if (!isPageActive('auth-link-broken')) {
      const { tlt: tempLoginToken, security_otp_challenge: security_otp_challenge_from_query } = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);
      const { security_otp_challenge: security_otp_challenge_from_tlt } = decodeJWT<{ security_otp_challenge?: string }>(
        tempLoginToken as string,
        decodeBase64URL,
      ).payload;
      const security_otp_challenge = security_otp_challenge_from_tlt ?? security_otp_challenge_from_query;
      if (!JSON.parse(security_otp_challenge || 'false')) {
        await AuthenticationService.loginVerify(tempLoginToken, env);
        navigateTo('auth-success');
      } else {
        navigateTo('auth-security-otp-challenge');
      }
    }
    aliasIdentity({ userID: uid });
  }, [])
    .rejected(err => {
      if (
        [ControlFlowErrorCode.AnomalousRequestDetected, ControlFlowErrorCode.AnomalousRequestApprovalRequired].includes(
          resolveErrorCode(err) as ControlFlowErrorCode,
        )
      ) {
        (err as ServiceError).getControlFlowError().setUIThreadError();
        navigateTo('auth-anomaly-detected');
      } else if (
        [ControlFlowErrorCode.MagicLinkRequestedFromDifferentIp].includes(resolveErrorCode(err) as ControlFlowErrorCode)
      ) {
        (err as ServiceError).getControlFlowError().setUIThreadError();
        navigateTo('auth-different-ip');
      } else {
        navigateTo('auth-expired');
      }
    })
    .fullfilled(async (result, context) => {
      if (context.redirect_url) {
        const redirectUrl = new URL(context.redirect_url);

        // overwrites magic_credential in the query
        redirectUrl.searchParams.set('magic_credential', result || '');
        // Only redirect if we have a result
        if (result) {
          window.location.href = redirectUrl.href;
        } else {
          // Stop poller if no `result` and error page is being shown
          loadingTimer.pause();
          timedOutTimer.pause();
        }
      }
    })
    .settled(context => {
      if (context.redirect_url) {
        dispatch(initAuthState());
      }
    });

  useTimerComplete(
    timedOutTimer,
    () => {
      if (
        !isPageActive([
          'auth-success',
          'auth-expired',
          'auth-anomaly-detected',
          'auth-link-broken',
          'auth-different-ip',
          'auth-redirect-failed',
          'auth-security-otp-challenge',
          'auth-security-otp-expired',
        ])
      ) {
        navigateTo('auth-failed');
      }
    },
    [isPageActive],
  );

  return loadingTimer.isRunning() ? <AuthPending /> : page;
}

export const Confirm: React.FC = () => {
  const page = useMagicLinkConfirmation();

  return (
    <StandardPage>
      <Modal in>{page}</Modal>
    </StandardPage>
  );
};

/**
 * Naively checks if the given string (`base64`)
 * is a valid and parseable Base64 string.
 */
function isValidBase64(base64: string) {
  try {
    decodeBase64URL(base64);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns boolean indicating whether the magic link recieved is likely broken,
 * malformed, or mis-copied from the email client. We infer this by testing
 * whether known base64-encoded properties in the URL query are valid and
 * parseable.
 */
function isMagicLinkProbablyBroken() {
  const expectedBase64QueryFields = ['ct', 'location'];
  const queryFieldsFound = Object.keys(getParsedQueryParams());

  return !expectedBase64QueryFields.every(field => {
    // Ensure that `field` is a valid Base64 string.
    // If we can't parse it, then probably the link is broken.
    return queryFieldsFound.includes(field) && isValidBase64(getRawOptions(field));
  });
}
