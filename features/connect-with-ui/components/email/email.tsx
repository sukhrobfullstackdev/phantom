import { Typography } from '@magiclabs/ui';
import React from 'react';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import styles from './email.less';

export const Email = () => {
  const email = useSelector(state => state.Auth.userEmail);

  return (
    <Typography.BodySmall className={styles.email} weight="400">
      {email}
    </Typography.BodySmall>
  );
};
