import React from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './profile-image.less';
import { ProfileIcon } from '~/shared/svg/magic-connect';
import { store } from '~/app/store';

export const ProfileImage = ({ height }) => {
  const profilePictureUrl = store.hooks.useSelector(state => state.User.profilePictureUrl);
  const { theme } = useTheme();

  return (
    <Flex justifyContent="center" alignItems="center" className={styles.wrapper}>
      {profilePictureUrl ? (
        <img
          className={styles.googleProfilePicture}
          alt="profile"
          height={height}
          referrerPolicy="no-referrer"
          src={profilePictureUrl}
        />
      ) : (
        <div className={styles.profileIconContainer} style={{ maxHeight: `${height}px` }}>
          <div className={styles.iconBackground}>
            <Spacer size={6} orientation="vertical" />
            <Icon className={styles.profilePicture} type={ProfileIcon} color={theme.hex.primary.base} size={height} />
          </div>
        </div>
      )}
    </Flex>
  );
};
