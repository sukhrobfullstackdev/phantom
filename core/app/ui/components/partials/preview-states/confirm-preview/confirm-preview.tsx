import React from 'react';
import { Flex } from '@magiclabs/ui';
import { AuthSuccess } from '../../auth-confirm-states/auth-success';
import { StandardPage } from '../../../layout/standard-page';
import { Modal } from '../../../layout/modal';

export const ConfirmPreview: React.FC = () => {
  return (
    <StandardPage>
      <Modal in>
        <Flex.Column horizontal="center">
          <AuthSuccess />
        </Flex.Column>
      </Modal>
    </StandardPage>
  );
};
