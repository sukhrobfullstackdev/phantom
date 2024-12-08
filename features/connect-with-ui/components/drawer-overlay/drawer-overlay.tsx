import React, { useEffect, useState } from 'react';
import { Drawer } from '../drawer';
import styles from './drawer-overlay.less';

export const DrawerOverlay = ({ children, isDrawerOpen, setIsDrawerOpen, openFrom }) => {
  const [height, setHeight] = useState<any>(0);
  const modal = document.getElementById('magic-modal');

  useEffect(() => {
    let resizeObserver;
    if (modal) {
      resizeObserver = new ResizeObserver(() => {
        setHeight(modal.offsetHeight);
      }).observe(modal);
    }
    return () => {
      resizeObserver?.disconnect();
      setHeight(0);
    };
  }, []);

  return (
    <div>
      <div
        className={isDrawerOpen ? styles.overlay : ''}
        style={
          isDrawerOpen
            ? {
                height,
              }
            : {}
        }
        onClick={() => setIsDrawerOpen(false)}
        onKeyPress={() => setIsDrawerOpen(false)}
        role="none"
      />
      <Drawer openFrom={openFrom} isDrawerOpen={isDrawerOpen}>
        {children}
      </Drawer>
    </div>
  );
};
