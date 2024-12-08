import { Linkable } from '@magiclabs/ui';
import React from 'react';
import { getApiKey } from '~/app/libs/api-key';
import { createAnchorTagProps } from '~/app/libs/link-resolvers';

import styles from './login-page-demo-view.less';

export const LoginPageDebug: React.FC = () => {
  return (
    <div className={styles.LoginPageDebug}>
      <div className={styles.section}>
        <h3>Customize</h3>
        <p>
          <Linkable>
            <a {...createAnchorTagProps('https://dashboard.magic.link')}>Use Dashboard</a>
          </Linkable>{' '}
          to update your login methods and customize branding
        </p>
      </div>

      <div className={styles.section}>
        <h3>Go live</h3>
        <p>
          <Linkable>
            <a {...createAnchorTagProps('https://magic.link/docs/login-form')}>Visit docs</a>
          </Linkable>{' '}
          for a complete setup guide or{' '}
          <Linkable>
            <a href={`https://dashboard.magic.link/api/pnp/create-zip?ak=${getApiKey()}`}>download a demo</a>
          </Linkable>
        </p>
      </div>

      <div className={styles.section}>
        <h3>Bring your own UI</h3>
        <p>
          To authenticate users with your own custom frontend UI,{' '}
          <Linkable>
            <a {...createAnchorTagProps('https://magic.link/docs/advanced/customization/custom-ui#bring-your-own-ui')}>
              visit docs
            </a>
          </Linkable>
        </p>
      </div>
    </div>
  );
};
