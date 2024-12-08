import React, { useEffect, useState } from 'react';
import { CallToAction, Icon } from '@magiclabs/ui';
import styles from './call-to-action-overload.less';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { CheckmarkIcon } from '~/shared/svg/settings';
import useIsFirstRender from '../../hooks/useIsFirstRender';
import { useTheme } from '~/app/ui/hooks/use-theme';

type CallToActionOverloadProps = React.ComponentProps<typeof CallToAction.button>;

// @TODO replace this component once the design is updated in component lib
export const CallToActionOverload = ({ className, ...rest }: CallToActionOverloadProps) => {
  return <CallToAction {...rest} className={[className || '', styles.callToActionOverload].join(' ')} />;
};

export const CallToActionIconButtonOverload = ({ className, ...rest }: CallToActionOverloadProps) => {
  return (
    <CallToAction {...rest} className={[className || '', styles.callToActionOverload, styles.iconBtn].join(' ')} />
  );
};

export interface StatefulButtonProps extends CallToActionOverloadProps {
  isLoading?: boolean;
  isSuccessful?: boolean;
  showSuccessDurationMs?: number;
  onHideSuccess?: () => any | Promise<any>;
}

export const CallToActionStateful = ({
  className,
  children,
  isLoading,
  isSuccessful,
  onHideSuccess,
  showSuccessDurationMs,
  ...rest
}: StatefulButtonProps) => {
  const isFirstRender = useIsFirstRender();
  const successDisplayDurationMs = showSuccessDurationMs || 800;
  const [shouldShowSuccess, setShouldShowSuccess] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if ((!isFirstRender && !isLoading) || isSuccessful) {
      setShouldShowSuccess(true);
      setTimeout(() => {
        if (onHideSuccess) {
          setShouldShowSuccess(false);
          onHideSuccess();
        }
      }, successDisplayDurationMs);
    }
  }, [isLoading, isSuccessful]);

  let content = children;

  if (isLoading) {
    content = <LoadingSpinner color={theme.isDarkTheme ? '#000' : '#FFF'} size={20} strokeSize={3} />;
  }

  if (shouldShowSuccess) {
    content = <Icon color={theme.isDarkTheme ? '#000' : '#FFF'} type={CheckmarkIcon} size={17} />;
  }

  return (
    <CallToAction {...rest} className={[className || '', styles.statefulButton].join(' ')}>
      {content}
    </CallToAction>
  );
};
