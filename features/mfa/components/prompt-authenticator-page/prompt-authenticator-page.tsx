import React from 'react';
import { CallToAction, Flex, Icon, Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import styles from './prompt-authenticator-page.less';
import { isAndroid } from '~/app/libs/platform';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button/';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { AuthyAuthenticatorIcon, GoogleAuthenticatorIcon } from '~/shared/svg/mfa';

const googleAuthAndroidLink = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2';
const googleAuthAppStoreLink = 'https://apps.apple.com/us/app/google-authenticator/id388497605';

export const PromptAuthenticatorPage = ({ returnToRoute }) => {
  const { navigateTo } = useControllerContext();

  const bodyCopy = i18n.mfa.prompt_authenticator_copy.toMarkdown(
    {
      google: `[Google Authenticator](${isAndroid() ? googleAuthAndroidLink : googleAuthAppStoreLink})`,
      authy: '[Authy](https://authy.com/download/)',
    },
    { shouldEscapeReplacements: false, reactMarkdownProps: { linkTarget: '_blank' } },
  );

  return (
    <div className={styles.promptAuthenticatorPage}>
      <ModalHeader
        rightAction={!returnToRoute ? <CancelActionButton /> : null}
        leftAction={returnToRoute && <BackActionButton onClick={() => navigateTo(returnToRoute)} />}
      />
      <Flex.Row justifyContent="center" alignItems="center">
        <Icon type={AuthyAuthenticatorIcon} />
        <Spacer size={12} />
        <Icon type={GoogleAuthenticatorIcon} />
      </Flex.Row>
      <Spacer size={22} orientation="vertical" />
      <h1 className={styles.promptAuthTitle}>{i18n.mfa.prompt_authenticator_title.toString()}</h1>
      <Spacer size={8} orientation="vertical" />
      <div className={styles.promptAuthBody}>{bodyCopy}</div>
      <Spacer size={40} orientation="vertical" />
      <CallToAction onClick={() => navigateTo('mfa-enroll-code')}>{i18n.mfa.next.toString()}</CallToAction>
    </div>
  );
};
