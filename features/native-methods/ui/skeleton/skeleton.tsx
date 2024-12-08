import React, { CSSProperties } from 'react';
import styles from './skeleton.less';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = 96, height = 96, style }) => {
  return (
    <div
      className={styles.skeleton}
      style={{
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`,
        ...style,
      }}
    />
  );
};

export default Skeleton;
