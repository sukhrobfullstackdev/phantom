import { Flex, Spacer, Typography } from '@magiclabs/ui';
import React, { HTMLAttributes } from 'react';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './privacy-and-terms.less';

export const PrivacyAndTerms = (props: HTMLAttributes<HTMLDivElement>) => {
  const theme = useTheme();
  return (
    <Flex.Row justifyContent="center" alignItems="center" {...props}>
      <a className={styles.legalLink} href="https://magic.link/legal/privacy-policy" target="_blank" rel="noreferrer">
        <Typography.BodySmall color={theme.theme.color.mid.base.string()} weight="600">
          Privacy
        </Typography.BodySmall>
      </a>
      <Spacer size={8} />
      <div
        className={styles.cssDot}
        style={{
          background: theme.theme.color.mid.base.string(),
        }}
      />
      <Spacer size={8} />
      <a className={styles.legalLink} href="https://magic.link/legal/terms-of-service" target="_blank" rel="noreferrer">
        <Typography.BodySmall color={theme.theme.color.mid.base.string()} weight="600">
          Terms
        </Typography.BodySmall>
      </a>
    </Flex.Row>
  );
};
