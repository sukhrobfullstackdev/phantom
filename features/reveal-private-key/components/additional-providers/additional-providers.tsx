import { Spacer } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { LoginButton } from '../login-buttons';
import { useLoginPageContext } from '../context';
import { i18n } from '~/app/libs/i18n';
import { useBouncyTransition } from '~/features/pnp/components/login-page/animations';

import styles from './additional-providers.less';

type LoginButtonComponentType = (typeof LoginButton)[keyof typeof LoginButton];

export const AdditionalProviders: React.FC = () => {
  const { providers, requestInProgress, focusedProvider } = useLoginPageContext();

  const transition = useBouncyTransition();
  const filteredProviders = useMemo(
    () => providers.filter(provider => provider !== focusedProvider),
    [providers, focusedProvider],
  );

  const additionalButtons = useMemo(
    () =>
      filteredProviders.map(provider => {
        return {
          key: provider,
          element: (
            <motion.div
              key={`AdditionalProviders:${provider}`}
              layoutId={`AdditionalProviders:${provider}`}
              layout="position"
              {...transition()}
              style={{ width: '100%' }}
            >
              {React.createElement(LoginButton[provider] as LoginButtonComponentType, {
                size: 'full',
                disabled: requestInProgress,
              })}
            </motion.div>
          ),
        };
      }),
    [filteredProviders, requestInProgress, transition],
  );

  interface ButtonRenderProps {
    buttons: Array<{ key: React.Key; element: React.ReactNode }>;
  }

  const VerticallyStackedButtons: React.FC<ButtonRenderProps> = props => {
    const { buttons } = props;

    return (
      <>
        {buttons.map(btn => (
          <React.Fragment key={btn.key}>
            {btn.element}
            <Spacer size={12} orientation="vertical" />
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <>
      <Spacer size={18} orientation="vertical" />

      {!!additionalButtons.length && focusedProvider !== undefined && (
        <>
          <div className={styles.or} aria-hidden="true">
            {i18n.pnp.or.toString()}
          </div>
          <Spacer size={18} orientation="vertical" />
        </>
      )}

      <VerticallyStackedButtons buttons={additionalButtons} />
    </>
  );
};
