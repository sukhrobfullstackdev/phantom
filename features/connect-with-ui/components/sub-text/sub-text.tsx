import React from 'react';
import styles from './sub-text.less';

export const SubText = ({ children, ...rest }) => {
  return (
    <span className={styles.subText} {...rest}>
      {children}
    </span>
  );
};
