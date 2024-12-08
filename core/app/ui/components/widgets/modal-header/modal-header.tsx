import React, { ComponentProps, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './modal-header.less';

interface ModalHeaderProps extends ComponentProps<'div'> {
  rightAction?: JSX.Element | null;
  leftAction?: JSX.Element | null;
  header?: JSX.Element | string;
}

export const ModalHeader = ({ rightAction, leftAction, header, children, ...rest }: ModalHeaderProps) => {
  const [portalReady, setPortalReady] = useState(!!document.getElementById('modal-portal'));

  useEffect(() => setPortalReady(true), []);

  return portalReady ? (
    createPortal(
      <div className={styles.header} {...rest}>
        {leftAction ?? <div />}
        {header ?? <div />}
        {rightAction ?? <div />}
        {children}
      </div>,
      document.getElementById('modal-portal') || document.body,
    )
  ) : (
    <></>
  );
};
