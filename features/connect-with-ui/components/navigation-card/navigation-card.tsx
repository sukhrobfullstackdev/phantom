import React from 'react';
import styles from './navigation-card.less';

export const NavigationCard = ({ onClick, children, isDisabled = false }) => {
  return (
    <button
      className={`${styles.navigationCard} ${isDisabled ? styles.disabled : ''}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};
