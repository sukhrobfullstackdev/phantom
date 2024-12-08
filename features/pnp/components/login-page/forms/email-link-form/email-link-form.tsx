import React, { useCallback } from 'react';
import { CallToAction, mergeProps, Spacer, TextField } from '@magiclabs/ui';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { useLoginPageContext } from '../../context';
import { i18n } from '~/app/libs/i18n';
import { motion } from '~/app/libs/polyfills/framer-motion';
import { useBouncyTransition } from '../../animations';
import { LoginMethodType } from '~/app/constants/flags';
import { pnpStore } from '~/features/pnp/store';
import { setEmailForm } from '~/features/pnp/store/pnp.actions';

import styles from './email-link-form.less';

export const EmailLinkForm: React.FC = () => {
  const email = pnpStore.hooks.useSelector(state => state.email) ?? '';
  const handleEmailInputOnChange = useCallback(e => pnpStore.dispatch(setEmailForm(e.target.value)), []);

  const { requestInProgress, initiateRequest } = useLoginPageContext();
  const transition = useBouncyTransition();

  const doEmailLinkLogin = useCloseUIThread([LoginMethodType.EmailLink, email]);

  const handleSubmitOnEnter: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key === 'Enter') {
        doEmailLinkLogin();
      }
    },
    [doEmailLinkLogin],
  );

  return (
    <div className={styles.EmailLinkForm}>
      <motion.div key="login-form" layoutId="EmailLinkForm" {...transition()}>
        <TextField
          disabled={requestInProgress}
          placeholder={i18n.pnp.email_address.toString()}
          value={email}
          onKeyPress={handleSubmitOnEnter}
          onChange={handleEmailInputOnChange}
          autoComplete="email"
          autoFocus
        />
      </motion.div>

      <Spacer size={24} orientation="vertical" />

      <CallToAction
        className={styles.submit}
        disabled={requestInProgress || !email.length}
        aria-label={i18n.pnp.login_signup_aria.toString()}
        {...mergeProps({ onPress: initiateRequest }, { onPress: doEmailLinkLogin })}
      >
        {i18n.pnp.login_signup.toString()}
      </CallToAction>
    </div>
  );
};
