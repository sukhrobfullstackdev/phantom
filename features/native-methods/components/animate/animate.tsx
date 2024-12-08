import React from 'react';
import { AnimatePresence, AnimatePresenceProps } from 'framer-motion';

type Props = Omit<AnimatePresenceProps, 'children'> & {
  children: React.ReactNode;
};

export const Animate = ({ children, ...rest }: Props) => {
  return <AnimatePresence {...rest}>{children}</AnimatePresence>;
};
