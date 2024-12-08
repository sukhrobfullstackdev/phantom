import React from 'react';
import styles from './need-help.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';

export const NeedHelpTextLink = () => {
  const { navigateTo } = useControllerContext();
  return (
    <button className={styles.textLinkButton} onClick={() => navigateTo('contact-support')}>
      Need help?
    </button>
  );
};
