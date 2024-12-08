import React from 'react';
import { DuotoneIconDefinition, Icon } from '@magiclabs/ui';
import styles from './collectible-social-link.less';

interface CollectibleSocialLinkProps {
  link: string;
  icon: DuotoneIconDefinition;
}

export const CollectibleSocialLink: React.FC<CollectibleSocialLinkProps> = ({ link, icon }) => {
  return (
    <a href={link} target="_blank" rel="noreferrer" className={styles.link}>
      <Icon.Duotone type={icon} size={40} className={styles.icon} />
    </a>
  );
};
