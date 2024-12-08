import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from '@magiclabs/ui';

import { SpinnerIcon } from '~/features/native-methods/ui/icons/SpinnerIcon';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { usePrimaryColor } from '~/features/native-methods/hooks/usePrimaryColor';
import styles from './button.less';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'black' | 'neutral' | 'primary';
  size?: 'lg' | 'md' | 'sm';
};

export const Button = ({
  disabled,
  variant = 'primary',
  size = 'md',
  loading = false,
  style,
  children,
  ...rest
}: Props) => {
  const { mode, isDark } = useThemeMode();
  const { primaryColor } = usePrimaryColor();

  return (
    <button
      className={clsx(
        styles['magic-button'],
        styles[`variant-${variant}${mode('', '-dark')}`],
        styles[`size-${size}`],
        loading && styles.loading,
      )}
      disabled={disabled}
      style={{
        ...(variant === 'primary' && {
          backgroundColor: primaryColor,
        }),
        ...style,
      }}
      {...rest}
    >
      {loading ? <SpinnerIcon isDark={!isDark} size={24} color={mode('white', 'var(--slate0)')} /> : children}
    </button>
  );
};
