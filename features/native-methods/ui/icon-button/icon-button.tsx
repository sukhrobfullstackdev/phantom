import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from '@magiclabs/ui';

import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';

import styles from './icon-button.less';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = ({ disabled, style, children, ...rest }: Props) => {
  const { mode } = useThemeMode();

  return (
    <button
      className={clsx(styles[`magic-icon-button`], styles[`variant-primary${mode('', '-dark')}`])}
      disabled={disabled}
      style={{
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
