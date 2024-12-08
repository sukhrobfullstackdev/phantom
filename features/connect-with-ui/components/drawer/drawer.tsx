import React from 'react';
import { Spacer } from '@magiclabs/ui';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './drawer.less';

export const Drawer = ({ children, isDrawerOpen, openFrom }) => {
  return (
    <>
      <AnimatePresence initial={false}>
        {isDrawerOpen && (
          <motion.div
            className={openFrom === 'top' ? styles.topDrawerSpacer : styles.bottomDrawerSpacer}
            initial={{ opacity: 0 }}
            transition={{ duration: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0, delay: 0.3 } }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={`${styles.drawer} ${openFrom === 'top' ? styles.topDrawer : styles.bottomDrawer}`}
        animate={{ height: isDrawerOpen ? 'inherit' : 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden={!isDrawerOpen}
      >
        {children}
        <Spacer size={5} orientation="vertical" />
      </motion.div>
    </>
  );
};
