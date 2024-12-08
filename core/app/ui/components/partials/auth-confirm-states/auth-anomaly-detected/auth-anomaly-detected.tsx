/* eslint-disable no-nested-ternary */

import React, { useCallback, useEffect, useState } from 'react';
import { CallToAction, Flex, Icon, MonochromeIcons, Spacer } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { i18n } from '~/app/libs/i18n';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { requestAnomalyApprove } from '~/app/services/authentication/request-anomaly-approve';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { AuthenticationService } from '~/app/services/authentication';
import { ControlFlowErrorCode } from '~/app/libs/exceptions';
import { useTheme } from '~/app/ui/hooks/use-theme';

import styles from './auth-anomaly-detected.less';

export const AuthAnomalyDetected: React.FC = () => {
  const errorCode = useActiveControlFlowErrorCode();

  const { navigateTo } = useControllerContext<'auth-failed'>();
  const [isRequestBlocked, setIsRequestBlocked] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { tlt: tempLoginToken, e: env, location } = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);

  useEffect(() => {
    if (errorCode === ControlFlowErrorCode.AnomalousRequestDetected) {
      trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'blocked' });
      setIsRequestBlocked(true);
    }
  }, []);

  const confirmRequest = useCallback(async () => {
    try {
      await requestAnomalyApprove(tempLoginToken, env);
      /*
       * `/approve` doesn't resolve `loginWithMagicLink`,
       * it effectively unblocks _subsequent_ login requests,
       * hence the `window.location.reload`
       */
      window.location.reload();
    } catch {
      navigateTo('auth-failed');
    }
  }, [navigateTo]);

  const blockRequest = useCallback(async () => {
    try {
      const res = await AuthenticationService.requestAnomalyBlock(tempLoginToken, env);
      setIsRequestBlocked(true);
      setIsAdminUser(!!res.data.role?.is_admin);
      trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'blocked' });
    } catch {
      navigateTo('auth-failed');
    }
  }, []);

  const blockedCopy = isAdminUser
    ? i18n.login.thanks_for_helping_us_keep_your_account_secure_admin.toMarkdown()
    : i18n.login.thanks_for_helping_us_keep_your_account_secure.toMarkdown();

  const awaitingInputCopy = i18n.login.let_us_know_if_you_recognize.toMarkdown();

  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center" className={styles.AuthAnomalyDetected}>
      {isRequestBlocked ? (
        <Icon type={MonochromeIcons.Remove} color={theme.hex.error.base} size={40} />
      ) : (
        <Icon type={MonochromeIcons.QuestionOutlined} color={theme.hex.warning.base} size={40} />
      )}

      <Spacer orientation="vertical" size={28} />

      <h1>{isRequestBlocked ? i18n.login.blocked_request.toMarkdown() : i18n.login.is_this_you.toMarkdown()}</h1>

      <Spacer orientation="vertical" size={8} />

      <div className="fontDescriptionSmall fontCentered">{isRequestBlocked ? blockedCopy : awaitingInputCopy}</div>

      <Spacer orientation="vertical" size={24} />

      <div className={styles.details}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {i18n.login.location.toMarkdown()}&nbsp;&nbsp;<b>{atob(location ?? '') || 'Berkeley, California, USA'}</b>
        </div>
      </div>

      <Spacer orientation="vertical" size={40} />

      {isRequestBlocked ? (
        <div>{i18n.login.you_can_close_this_window.toMarkdown()}</div>
      ) : (
        <>
          <CallToAction style={{ width: '100%' }} onPress={confirmRequest}>
            {i18n.login.yes_this_is_me.toMarkdown()}
          </CallToAction>
          <Spacer orientation="vertical" size={16} />
          <CallToAction style={{ width: '100%' }} color="error" onPress={blockRequest}>
            {i18n.login.no_block_this.toMarkdown()}
          </CallToAction>
        </>
      )}
    </Flex.Column>
  );
};

AuthAnomalyDetected.displayName = 'AuthAnomalyDetected';
