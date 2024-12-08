import React, { HTMLAttributes } from 'react';
import styles from './base-page.less';

export const BasePage = ({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`${styles.basePage} ${className ?? ''}`} {...rest}>
    {children}
  </div>
);
