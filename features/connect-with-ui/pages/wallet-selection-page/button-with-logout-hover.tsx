import React, { useState } from 'react';
import { MonochromeIcons, TextButton, Typography } from '@magiclabs/ui';
import { connectStore } from '~/features/connect-with-ui/store';
import { Button, ButtonSize, ButtonVariant } from '~/features/connect-with-ui/components/button';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { connectLogout } from '~/features/connect-with-ui/store/connect.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import styles from './wallet-selection-page.less';
import { store } from '~/app/store';

export const ButtonWithLogoutHover = () => {
  const { navigateTo } = useControllerContext();
  const [showUserInfoTooltip, setShowUserInfoTooltip] = useState(false);
  const userEmail = useSelector(state => state.Auth.userEmail);
  const profilePictureUrl = store.hooks.useSelector(state => state.User.profilePictureUrl);

  const handleLogout = () => {
    connectStore.dispatch(connectLogout());
    navigateTo('login-prompt');
  };

  return (
    <div
      onMouseEnter={() => setShowUserInfoTooltip(true)}
      onMouseLeave={() => setShowUserInfoTooltip(false)}
      aria-label="Account"
    >
      {profilePictureUrl ? (
        <div className={styles.profilePicture}>
          <img alt="profile" height="32px" referrerPolicy="no-referrer" src={profilePictureUrl} />
        </div>
      ) : (
        <div className={styles.button}>
          <Button
            iconType={MonochromeIcons.Profile}
            size={ButtonSize.small}
            variant={ButtonVariant.secondary}
            onClick={() => null}
          />
        </div>
      )}
      {showUserInfoTooltip && (
        <div className={styles.profileTooltip}>
          <Typography.BodySmall weight="400" className={styles.text}>
            {userEmail}
          </Typography.BodySmall>
          <TextButton className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </TextButton>
        </div>
      )}
    </div>
  );
};
