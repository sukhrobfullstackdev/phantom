import React, { InputHTMLAttributes, forwardRef, useMemo, useState } from 'react';
import { Flex, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';

import styles from './text-filed.less';
import { usePrimaryColor } from '../../hooks/usePrimaryColor';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string | React.ReactElement;
  errorMessage?: string;
  rightIcon?: React.ReactElement;
};

export const TextField = forwardRef<HTMLInputElement, Props>(
  ({ label, rightIcon, errorMessage, style, disabled, ...rest }: Props, ref) => {
    const { mode, isDark } = useThemeMode();
    const { primaryColor } = usePrimaryColor();
    const [isFocused, setIsFocused] = useState(false);

    const isError = useMemo(() => {
      return errorMessage && errorMessage.trim().length > 0;
    }, [errorMessage]);

    const boderColor = useMemo(() => {
      if (isError) {
        return isDark ? 'var(--dark-ruby100)' : 'var(--alert70)';
      }
      return isDark ? 'var(--slate4)' : 'var(--ink30)';
    }, [isDark, isError]);

    return (
      <Flex
        direction="column"
        alignItems="flex-start"
        style={{
          gap: '8px',
          width: '100%',
          opacity: disabled ? 0.3 : 1,
        }}
      >
        {typeof label === 'string' ? (
          <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--white')}>
            {label}
          </Typography.BodySmall>
        ) : (
          <>{label}</>
        )}

        <Flex
          alignItems="center"
          style={{
            width: '100%',
            height: 'fit-content',
            borderRadius: '10px',
            border: `1px solid ${isFocused ? 'transparent' : boderColor}`,
            boxShadow: isFocused ? `0px 0px 0px 2px ${primaryColor}` : 'none',
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        >
          <input
            ref={ref}
            className={styles['magic-text-field']}
            style={{
              padding: rightIcon ? '12px 16px 12px 12px' : '12px 16px',
              ...style,
            }}
            disabled={disabled}
            onFocus={() => {
              setIsFocused(true);
            }}
            {...rest}
          />
          {rightIcon && (
            <div
              style={{
                marginRight: '16px',
                pointerEvents: disabled ? 'none' : 'auto',
              }}
            >
              {rightIcon}
            </div>
          )}
        </Flex>
        {isError && (
          <Typography.BodySmall
            weight="400"
            color={mode('var(--alert70)', 'var(--dark-ruby100)')}
            style={{ textAlign: 'start' }}
          >
            {errorMessage}
          </Typography.BodySmall>
        )}
      </Flex>
    );
  },
);
