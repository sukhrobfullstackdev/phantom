import React from 'react';
import { motion } from 'framer-motion';
import styles from './network-drawer.less';

const NetworkDrawer = ({ children, isDrawerOpen }) => (
  <div className={styles.container}>
    <motion.div
      className={styles.motionDiv}
      animate={{
        height: isDrawerOpen ? 'inherit' : 0,
        width: isDrawerOpen ? 'inherit' : '25%',
      }}
      transition={{ duration: 0.3 }}
      aria-hidden={!isDrawerOpen}
    >
      {children}
    </motion.div>
  </div>
);

export default NetworkDrawer;
