import React, { useCallback } from 'react';
import { CallToAction, mergeProps, Spacer, TextField } from '@magiclabs/ui';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { useLoginPageContext } from '../../context';
import { motion } from '~/app/libs/polyfills/framer-motion';
import { useBouncyTransition } from '~/features/pnp/components/login-page/animations';
import { LoginMethodType } from '~/app/constants/flags';
import { revealStore } from '~/features/reveal-private-key/store';
import { setWebAuthnForm } from '~/features/reveal-private-key/store/reveal.actions';

import styles from './webauthn-form.less';

export const WebAuthnForm: React.FC = () => {
  const username = revealStore.hooks.useSelector(state => state.username) ?? '';
  const handleWebAuthnInputOnChange = useCallback(e => revealStore.dispatch(setWebAuthnForm(e.target.value)), []);

  const { requestInProgress, initiateRequest } = useLoginPageContext();
  const transition = useBouncyTransition();

  const doWebAuthnLogin = useCloseUIThread([LoginMethodType.WebAuthn, username]);

  const handleSubmitOnEnter: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key === 'Enter') {
        doWebAuthnLogin();
      }
    },
    [doWebAuthnLogin],
  );

  return (
    <div className={styles.WebAuthnForm}>
      <motion.div key="login-form" layoutId="WebAuthnForm" {...transition()}>
        <TextField
          disabled={requestInProgress}
          placeholder="Username"
          value={username}
          onKeyPress={handleSubmitOnEnter}
          onChange={handleWebAuthnInputOnChange}
          autoComplete="username"
          autoFocus
        />
      </motion.div>

      <Spacer size={24} orientation="vertical" />

      <CallToAction
        className={styles.submit}
        disabled={requestInProgress || !username.length}
        aria-label="Log in"
        {...mergeProps({ onPress: initiateRequest }, { onPress: doWebAuthnLogin })}
      >
        Log in
      </CallToAction>
    </div>
  );
};
