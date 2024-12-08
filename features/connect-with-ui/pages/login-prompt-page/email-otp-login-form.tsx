import { Spacer, TextField, CallToAction } from '@magiclabs/ui';
import React, { useState } from 'react';
import { store } from '~/app/store';
import { setReturnRoutePageId } from '~/app/store/ui-thread/ui-thread.actions';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { loginWithEmailOtpStore } from '~/features/email-otp/store';
import { setOtpEmail } from '~/features/email-otp/store/email-otp.actions';
import { TrackingButton } from '../../components/tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { AnalyticsActionType } from '~/app/libs/analytics';

export const EmailOtpLoginForm = () => {
  const [email, setEmail] = useState('');
  const { navigateTo } = useControllerContext();
  const isValid = email.length > 0;

  const handleLogin = () => {
    if (!isValid) return;
    store.dispatch(setReturnRoutePageId('login-prompt'));
    loginWithEmailOtpStore.dispatch(setOtpEmail(email));
    navigateTo('login-with-email-otp', eventData);
  };

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <TextField value={email} onChange={e => setEmail(e.target.value?.trim())} placeholder="Email address" />
      </form>
      <Spacer size={16} orientation="vertical" />
      <TrackingButton actionName={isValid ? AnalyticsActionType.LoginStarted : ''}>
        <CallToAction disabled={!isValid} onClick={handleLogin} style={{ width: '100%' }}>
          Log in / Sign up
        </CallToAction>
      </TrackingButton>
    </>
  );
};
