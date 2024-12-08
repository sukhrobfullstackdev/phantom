import { Icon, MonochromeIconDefinition } from '@magiclabs/ui';
import React, { useMemo } from 'react';
import { i18n } from '~/app/libs/i18n';

import styles from './loading-spinner.less';

interface LoadingSpinnerProps {
  small?: boolean;
  size?: number;
  strokeSize?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = props => {
  const { small, size, strokeSize, color } = props;

  let strokeWidth = small ? 4 : 6;
  let diameter = small ? 36 : 64;
  if (size) {
    diameter = size;
  }
  if (strokeSize) {
    strokeWidth = strokeSize;
  }

  const Spinner: MonochromeIconDefinition = useMemo(
    () => ({
      SVGContents: ({ stroke }) => {
        const radius = diameter / 2;
        const dashSize = 2 * Math.PI * radius;

        return (
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            strokeDasharray={dashSize}
            strokeDashoffset={dashSize - dashSize * 0.6 + strokeWidth * 2}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            {...stroke}
          />
        );
      },

      viewbox: [0, 0, diameter, diameter],

      color: theme => color || theme.hex.primary.base,
    }),

    [strokeWidth, diameter],
  );

  return (
    <div className={styles.LoadingSpinner}>
      <Icon aria-label={i18n.generic.loading.toString()} className={styles.loader} type={Spinner} />
    </div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';
