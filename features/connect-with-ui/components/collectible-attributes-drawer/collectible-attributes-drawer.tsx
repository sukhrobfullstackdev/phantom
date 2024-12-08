import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, Typography, Flex, Spacer } from '@magiclabs/ui';

import styles from './collectible-attributes-drawer.less';
import { AngleDown } from '~/shared/svg/magic-connect';

interface CollectibleAttributesDrawerProps {
  attributes: any[];
}

export const CollectibleAttributesDrawer: React.FC<CollectibleAttributesDrawerProps> = ({ attributes }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(prevValue => !prevValue);
  };

  return (
    <>
      <button className={styles.collectibleAttributesDrawerButton} onClick={toggleDrawer}>
        <Typography.BodySmall>Properties</Typography.BodySmall>
        <Flex.Row alignItems="center">
          <Typography.BodySmall weight="400">{attributes.length}</Typography.BodySmall>
          <Spacer size={8} orientation="horizontal" />
          <Icon className={isDrawerOpen ? styles.openDrawerAngleIcon : ''} type={AngleDown} color="var(--ink50)" />
        </Flex.Row>
      </button>
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            animate={{ height: 'auto' }}
            className={styles.drawer}
            initial={{ height: 0 }}
            transition={{ duration: 0.3 }}
            exit={{ height: 0, transition: { duration: 0.3 } }}
          >
            <Spacer size={8} orientation="vertical" />
            {attributes.map(attribute => (
              <div className={styles.attribute} key={attribute.trait_type}>
                <Typography.BodySmall weight="400">{attribute.trait_type}</Typography.BodySmall>
                <Typography.BodySmall weight="400">{attribute.value}</Typography.BodySmall>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
