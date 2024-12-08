import React, { useMemo } from 'react';
import { Flex, Typography } from '@magiclabs/ui';
import { PayPalHostedField, PayPalHostedFieldProps } from '@paypal/react-paypal-js';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';

type Props = PayPalHostedFieldProps & {
  label: string;
  errorMessage?: string;
  rightIcon?: React.ReactElement;
};

export const CustomPaypalHostedField = ({ label, errorMessage, rightIcon, ...rest }: Props) => {
  const { mode } = useThemeMode();
  const isError = useMemo(() => {
    return errorMessage && errorMessage.trim().length > 0;
  }, [errorMessage]);

  return (
    <Flex
      direction="column"
      alignItems="flex-start"
      style={{
        gap: '8px',
        width: '100%',
      }}
    >
      <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--white')}>
        {label}
      </Typography.BodySmall>
      <Flex
        alignItems="center"
        style={{
          border: `1px solid ${mode('var(--ink30)', 'var(--slate4)')}`,
          borderRadius: '10px',
          height: '48px',
          width: '100%',
        }}
      >
        <PayPalHostedField
          style={{
            padding: rightIcon ? '12px 16px 12px 12px' : '12px 16px',
            textAlign: 'left',
            width: '100%',
            background: 'transparent',
          }}
          {...rest}
        />
        {rightIcon && (
          <div
            style={{
              marginRight: '16px',
            }}
          >
            {rightIcon}
          </div>
        )}
      </Flex>
      {isError && (
        <Typography.BodySmall weight="400" color="var(--alert70)" style={{ textAlign: 'start' }}>
          {errorMessage}
        </Typography.BodySmall>
      )}
    </Flex>
  );
};
