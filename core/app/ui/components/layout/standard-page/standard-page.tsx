import { Flex, Spacer } from '@magiclabs/ui';
import React from 'react';
import { SecuredByMagic } from '../../widgets/secured-by-magic';

import styles from './standard-page.less';

interface StandardPageProps {
  showLogoInFooter?: boolean;
  children: React.ReactNode;
}

export const StandardPage: React.FC<StandardPageProps> = props => {
  const { children, showLogoInFooter = false } = props;

  return (
    <Flex.Column className={styles.StandardPage} justifyContent="space-between">
      <div>
        <Flex className={styles.main} justifyContent="center" shrink={0}>
          <div>{children}</div>
        </Flex>
      </div>

      {showLogoInFooter && (
        <Flex.Column className={styles.footer} horizontal="center" shrink={0}>
          <Spacer orientation="vertical" size="77px" />
          <SecuredByMagic />
          <Spacer orientation="vertical" size="32px" />
        </Flex.Column>
      )}
    </Flex.Column>
  );
};
