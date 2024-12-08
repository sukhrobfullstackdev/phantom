import React from 'react';
import { Modal } from '../../../layout/modal';
import { CheckEmail } from '../../pending-modal/login/check-email';

export const ModalPreview: React.FC = () => {
  return (
    <Modal in noAnimation>
      <CheckEmail />
    </Modal>
  );
};
