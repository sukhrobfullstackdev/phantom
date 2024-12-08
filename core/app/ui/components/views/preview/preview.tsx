import React, { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { useDispatch } from '../../../hooks/redux-hooks';
import { useController } from '../../../hooks/use-controller';
import { setUserEmail } from '../../../../store/auth/auth.actions';
import { useThemePreviewMessageChannel } from '../../../hooks/use-message-channels';

import styles from './preview.less';

import { EmailPreview } from '../../partials/preview-states/email-preview';
import { ConfirmPreview } from '../../partials/preview-states/confirm-preview';
import { ModalPreview } from '../../partials/preview-states/modal-preview';
import { LoginPreview } from '../../partials/preview-states/login-preview';
import { EmailOtpPreview } from '~/app/ui/components/partials/preview-states/email-otp-preview';
import { VerifyPreview } from '~/app/ui/components/partials/preview-states/verify-preview';
import { VerifySuccessPreview } from '~/app/ui/components/partials/preview-states/verify-success-preview';

export const Preview: React.FC = () => {
  useDocumentTitle('Magic—Theme Preview');

  useThemePreviewMessageChannel();

  const dispatch = useDispatch();
  useLayoutEffect(() => {
    dispatch(setUserEmail('hello@example.com'));
  }, []);

  const { page, navigateTo } = useController(
    [
      { id: 'email', content: <EmailPreview /> },
      { id: 'modal', content: <ModalPreview /> },
      { id: 'confirm', content: <ConfirmPreview /> },
      { id: 'login', content: <LoginPreview /> },
      { id: 'emailotp', content: <EmailOtpPreview /> },
      { id: 'verify', content: <VerifyPreview /> },
      { id: 'verifysuccess', content: <VerifySuccessPreview /> },
    ],

    { shouldAnimate: false },
  );

  const { id } = useParams<{ id: any }>();

  navigateTo(id);

  return (
    <div aria-hidden="true" className={styles.Preview}>
      {page}
    </div>
  );
};
