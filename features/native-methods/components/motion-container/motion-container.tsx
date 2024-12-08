import React from 'react';
import styles from './motion-container.less';
import { MotionDiv, MotionDivProps } from '../motion-div/motion-div';
import { Animate } from '../animate/animate';

type Props = MotionDivProps & {
  initial?: boolean;
};

export const MotionContainer = ({ children, initial = true, ...rest }: Props) => (
  <Animate initial={initial} exitBeforeEnter>
    <MotionDiv className={styles.container} {...rest}>
      {children}
    </MotionDiv>
  </Animate>
);
