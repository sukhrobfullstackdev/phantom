import { Flex, Typography } from '@magiclabs/ui';
import React, { TextareaHTMLAttributes, forwardRef, useMemo, useState } from 'react';

import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { usePrimaryColor } from '~/features/native-methods/hooks/usePrimaryColor';
import styles from './text-area.less';
import { WarningIcon } from '../icons/WarningIcon';
import { SuccessIcon } from '../icons/SuccessIcon';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string | React.ReactElement;
  errorMessage?: string;
  rightIcon?: React.ReactElement;
};

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, errorMessage, rightIcon, onChange, disabled, ...rest }: Props, ref) => {
    const { mode, isDark } = useThemeMode();
    const { primaryColor } = usePrimaryColor();
    const [isFocused, setIsFocused] = useState(false);
    const [isDirty, setIsDirty] = useState(true);

    const isError = useMemo(() => {
      return errorMessage && errorMessage.trim().length > 0;
    }, [errorMessage]);

    const boderColor = useMemo(() => {
      if (isError) {
        return isDark ? 'var(--dark-ruby100)' : 'var(--alert70)';
      }
      return isDark ? 'var(--slate4)' : 'var(--ink30)';
    }, [isDark, isError]);

    const rightIconSelector = useMemo(() => {
      if (isDirty) {
        return rightIcon;
      }

      if (isError) {
        return <WarningIcon size={24} color={mode('var(--alert70)', 'var(--dark-ruby100)')} />;
      }

      return <SuccessIcon size={24} color={primaryColor} />;
    }, [rightIcon, isError, isFocused, isDark]);

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
          <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--white)')}>
            {label}
          </Typography.BodySmall>
        ) : (
          <>{label}</>
        )}

        <Flex
          alignItems="center"
          onBlur={() => {
            setIsDirty(false);
            setIsFocused(false);
          }}
          style={{
            width: '100%',
            height: 'fit-content',
            borderRadius: '10px',
            border: `1px solid ${isFocused ? 'transparent' : boderColor}`,
            boxShadow: isFocused ? `0px 0px 0px 2px ${primaryColor}` : 'none',
          }}
        >
          <textarea
            ref={ref}
            className={styles['magic-text-area']}
            style={{
              padding: rightIcon ? '12px 16px 12px 12px' : '12px 16px',
            }}
            onFocus={() => {
              setIsFocused(true);
            }}
            onChange={e => {
              setIsDirty(true);
              onChange?.(e);
            }}
            disabled={disabled}
            spellCheck={false}
            rows={2}
            {...rest}
          />

          {rightIcon && (
            <div
              style={{
                marginRight: '16px',
              }}
            >
              {rightIconSelector}
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
