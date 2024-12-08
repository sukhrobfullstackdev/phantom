import { Flex } from '@magiclabs/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styles from './overlap-icons.less';

type OverlapIconsProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export const OverlapIcons = ({ left, right }: OverlapIconsProps) => (
  <AnimatePresence>
    <motion.div
      transition={{ delay: 0.1 }}
      animate={{
        opacity: [0, 1],
      }}
    >
      <Flex direction="row" justifyContent="center">
        <motion.div
          transition={{ delay: 0.8 }}
          animate={
            {
              '--padding-border': ['0px', '3px'],
            } as any
          }
          className={styles.overlapIcons}
        >
          {left}
        </motion.div>
        <motion.div
          transition={{ type: 'spring', delay: 0.6 }}
          animate={{
            marginLeft: ['1rem', '-0.8rem', '-0.5rem'],
          }}
        >
          {right}
        </motion.div>
      </Flex>
    </motion.div>
  </AnimatePresence>
);
