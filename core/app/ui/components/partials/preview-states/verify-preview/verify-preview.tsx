import React from 'react';
import { EmailVerificationPage } from '~/features/email-otp/components/verification-page';
import { Modal } from '../../../layout/modal';

export const VerifyPreview: React.FC = () => {
  return (
    <Modal in noAnimation>
      <EmailVerificationPage rom="rom" isSecondFactor={false} email="hiro@magic.link" resolveLogin={async () => {}} />
    </Modal>
  );
};
