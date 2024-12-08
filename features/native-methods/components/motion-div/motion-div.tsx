import React, { ComponentPropsWithRef } from 'react';
import { MotionProps, motion } from 'framer-motion';

export type MotionDivProps = MotionProps &
  ComponentPropsWithRef<'div'> & {
    depth?: number;
  };

export const MotionDiv = ({ children, depth = 40, ...rest }: MotionDivProps) => {
  return (
    <motion.div
      initial={{
        y: depth,
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { type: 'spring', velocity: 20, stiffness: 300, damping: 20 },
      }}
      exit={{
        y: depth,
        opacity: 0,
        transition: { ease: 'easeIn', duration: 0.15 },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
