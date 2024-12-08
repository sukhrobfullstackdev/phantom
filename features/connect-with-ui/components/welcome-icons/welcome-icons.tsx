import React, { useEffect, useState } from 'react';
import { Flex, Icon } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import { isMagicWalletDapp } from '~/app/libs/connect-utils';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { EarthIcon, MagicGradientIcon } from '~/shared/svg/magic-connect';
import { ProfileImage } from '../profile-image/profile-image';
import styles from './welcome-icons.less';

export const WelcomeIcons = () => {
  const [isLeftCircleAnimating, setIsLeftCircleAnimating] = useState(true);
  const smallIconSize = 40;

  useEffect(() => {
    const circleAnimation = setInterval(() => {
      setIsLeftCircleAnimating(prev => !prev);
    }, 3000);
    return () => {
      clearInterval(circleAnimation);
    };
  }, []);

  return (
    <motion.div
      transition={{ delay: 0.3, duration: 0.3 }}
      animate={{
        opacity: [0, 1],
      }}
    >
      <Flex.Row alignItems="center" justifyContent="center">
        <motion.div
          className={styles.profilePictureMotionDiv}
          transition={{ delay: 1.4, duration: 0.3 }}
          animate={{
            x: -70,
          }}
        >
          <ProfileImage height={smallIconSize} />
        </motion.div>
        <motion.div
          transition={{ delay: 1.7, duration: 0.3 }}
          animate={{
            opacity: [0, 1],
          }}
          style={{
            position: 'absolute',
            display: 'flex',
          }}
        >
          <div
            className={`${styles.leftCircleAnimatedBorder} ${isLeftCircleAnimating ? styles.animateLeftCircle : ''}`}
          />
          <div
            className={`${styles.rightCircleAnimatedBorder} ${!isLeftCircleAnimating ? styles.animateRightCircle : ''}`}
          />
        </motion.div>
        <motion.div
          transition={{ delay: 1.7, duration: 0.3 }}
          animate={{
            opacity: [0, 1],
          }}
          style={{
            position: 'absolute',
            display: 'flex',
          }}
        >
          <div className={styles.leftCircleBase} />
          <div className={styles.rightCircleBase} />
        </motion.div>
        <Icon type={MagicGradientIcon} size={70} className={styles.magicLogo} />
        <motion.div
          className={styles.appLogo}
          transition={{ delay: 1.4, duration: 0.3 }}
          animate={{
            x: 70,
          }}
        >
          {isMagicWalletDapp() ? (
            <Icon type={EarthIcon} size={smallIconSize} />
          ) : (
            <ThemeLogo height={smallIconSize} width={smallIconSize} />
          )}
        </motion.div>
      </Flex.Row>
    </motion.div>
  );
};
