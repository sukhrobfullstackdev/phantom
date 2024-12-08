import React, { useMemo } from 'react';

import { i18n } from '~/app/libs/i18n';
import { Button } from '~/features/native-methods/ui/button/button';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { ErrorIcon } from '~/features/native-methods/ui/icons/ErrorIcon';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Network } from '~/features/connect-with-ui/components/network';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { useSendTransactionParams } from '../../hooks/use-send-transaction-params';

export const SEND_TRANSACTION_ERROR_TYPES = {
  INVALID_PARAMS: 'INVALID_PARAMS',
  UNSUPPORTED_BROWSER: 'UNSUPPORTED_BROWSER',
} as const;

export type SendTransactionErrorType = keyof typeof SEND_TRANSACTION_ERROR_TYPES;

export const SendTransactionErrorPage = () => {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const {
    sendTransactionParams: { errorType },
  } = useSendTransactionParams();

  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());

  const errorMessage = useMemo(() => {
    if (errorType === SEND_TRANSACTION_ERROR_TYPES.INVALID_PARAMS) {
      return {
        title: 'Invalid params',
        description: 'Please check your params',
      };
    }

    if (errorType === SEND_TRANSACTION_ERROR_TYPES.UNSUPPORTED_BROWSER) {
      return {
        title: (
          <>
            To ensure your security, <br />
            log in from a web browser.
          </>
        ),
        description: `Please open this page in a web browser to log into ${theme.appName}.`,
        icon: <ErrorIcon size={40} />,
      };
    }

    return {
      title: i18n.nft_checkout.something_went_wrong.toString(),
      description: i18n.nft_checkout.ran_into_a_technical_issue.toString(),
    };
  }, [errorType]);

  return (
    <>
      <ModalHeader rightAction={<CancelActionButton />} header={<Network />} />

      <Flex.Column
        alignItems="center"
        style={{
          width: '100%',
        }}
      >
        <Spacer size={40} orientation="vertical" />

        <Flex
          direction="column"
          alignItems="center"
          style={{
            gap: '8px',
          }}
        >
          <Typography.H4
            weight="700"
            color={mode('var(--ink100)', 'var(--white)')}
            style={{
              textAlign: 'center',
            }}
          >
            {errorMessage.title}
          </Typography.H4>
          <Typography.BodyMedium
            weight="400"
            color={mode('var(--ink70)', 'var(--chalk44)')}
            style={{
              textAlign: 'center',
            }}
          >
            {errorMessage.description}
          </Typography.BodyMedium>

          <Spacer size={32} orientation="vertical" />

          <Button onClick={cancel} variant="black">
            <Typography.BodyMedium weight="600">{i18n.nft_checkout.close.toString()}</Typography.BodyMedium>
          </Button>
        </Flex>
      </Flex.Column>
    </>
  );
};
