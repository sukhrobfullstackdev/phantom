import { Flex, Spacer } from '@magiclabs/ui';
import React from 'react';
import { YouCanSavelyGoBackToApp } from '../confirm-send-transaction-details';
import { SignatureInfo } from '~/features/blockchain-ui-methods/pages/signature-request-page';

function parsePotentialJSON(jsonString) {
  try {
    if (typeof jsonString !== 'string') return jsonString;
    const data = JSON.parse(jsonString);
    return data;
  } catch (e) {
    return null;
  }
}

export const ConfirmSignMessageDetails = ({ appName, message, requestDomain, actionStatus }) => {
  if (actionStatus === 'REJECTED') {
    return (
      <>
        <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
          <b>You rejected the signature</b>
          <Spacer orientation="vertical" size={8} />
          <YouCanSavelyGoBackToApp appName={appName} />
        </Flex.Column>
      </>
    );
  }
  if (actionStatus === 'APPROVED') {
    return (
      <>
        <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
          <b>You successfully approved the signature!</b>
          <Spacer orientation="vertical" size={8} />
          <YouCanSavelyGoBackToApp appName={appName} />
        </Flex.Column>
      </>
    );
  }
  return (
    <>
      <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
        <b>Confirm your {appName} signature</b>
      </Flex.Column>
      <Spacer size={32} orientation="vertical" />
      <SignatureInfo
        messageToSign={parsePotentialJSON(message) || `${message}`}
        appName={appName}
        referrer={requestDomain}
      />
    </>
  );
};
