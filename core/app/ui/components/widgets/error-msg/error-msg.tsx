import { Spacer } from '@magiclabs/ui';
import styles from './error-msg.less';
import React from 'react';

interface ErrorMsgProps {
  errorMsg: string;
  paddingTop?: number;
}

export const ErrorMsg: React.FC<ErrorMsgProps> = props => {
  const { errorMsg, paddingTop = 0 } = props;

  return (
    <>
      {errorMsg && (
        <>
          <Spacer size={paddingTop} orientation="vertical" />
          <div className={`${styles.statusMessage} ${styles.statusMessageError}`}>{errorMsg}</div>
        </>
      )}
    </>
  );
};
