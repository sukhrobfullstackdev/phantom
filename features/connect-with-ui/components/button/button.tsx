import React, { HTMLAttributes } from 'react';
import { Flex, Icon, MonochromeIconDefinition, Spacer, Typography } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './button.less';

export enum ButtonSize {
  large = 'large',
  medium = 'medium',
  small = 'small',
  xSmall = 'xSmall',
}

export enum ButtonVariant {
  neutral = 'neutral',
  subtle = 'subtle',
  primary = 'primary',
  secondary = 'secondary',
}

export interface ButtonPropTypes extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  iconType: MonochromeIconDefinition;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  size?: typeof ButtonSize[keyof typeof ButtonSize];
  variant?: typeof ButtonVariant[keyof typeof ButtonVariant];
  label?: string;
}

export const Button = ({
  iconType,
  onClick,
  size = ButtonSize.small,
  variant = ButtonVariant.neutral,
  label,
  disabled = false,
}: ButtonPropTypes) => {
  const theme = useTheme().theme.isDarkTheme ? 'dark' : 'light';
  return (
    <Flex.Column
      className={[styles.actionButton, disabled ? styles.disabled : ''].join(' ')}
      onClick={e => {
        return disabled ? () => {} : onClick(e);
      }}
    >
      <div className={[styles.actionCircle, styles[size], styles[theme], disabled ? styles.disabled : ''].join(' ')}>
        <button
          className={[
            styles.actionIcon,
            styles[size],
            styles[variant],
            styles[theme],
            disabled ? styles.disabled : '',
          ].join(' ')}
          aria-hidden={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          <Icon type={iconType} />
        </button>
      </div>
      <Spacer size={size} orientation="vertical" />
      <Typography.BodySmall weight="500" color="inherit">
        {label}
      </Typography.BodySmall>
    </Flex.Column>
  );
};

Button.defaultProps = {
  disabled: false,
  label: '',
  size: ButtonSize.medium,
  variant: ButtonVariant.neutral,
};
