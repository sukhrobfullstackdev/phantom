import { Flex, Spacer } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { LoginButton } from '../login-buttons';
import { useLoginPageContext } from '../context';
import { i18n } from '~/app/libs/i18n';
import { useBouncyTransition } from '../animations';
import { LoginMethodType } from '~/app/constants/flags';

import styles from './additional-providers.less';

// The providers listed here are emphasized in UI by default.
// All other providers are considered "understated" and shown in a separate list.
const amplifiedProviders: string[] = [LoginMethodType.EmailLink, LoginMethodType.SMS];

type LoginButtonComponentType = (typeof LoginButton)[keyof typeof LoginButton];

export const AdditionalProviders: React.FC = () => {
  const { providers, requestInProgress, focusedProvider } = useLoginPageContext();

  const transition = useBouncyTransition();
  const filteredProviders = useMemo(
    () => providers.filter(provider => provider !== focusedProvider),
    [providers, focusedProvider],
  );

  const amplifiedButtons = useMemo(
    () =>
      filteredProviders
        .filter(provider => amplifiedProviders.includes(provider) && !!LoginButton[provider])
        .map(provider => {
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

  const showUnderstatedButtonsAsCondensed = useMemo(
    () => amplifiedButtons.length || (!!focusedProvider && amplifiedProviders.includes(focusedProvider)),
    [amplifiedButtons, focusedProvider],
  );

  const understatedButtons = useMemo(
    () =>
      filteredProviders
        .filter(provider => !amplifiedProviders.includes(provider) && !!LoginButton[provider])
        .map(provider => {
          return {
            key: provider,
            element: (
              <motion.div
                key={`AdditionalProviders:${provider}`}
                layoutId={`AdditionalProviders:${provider}`}
                layout="position"
                {...transition()}
                style={{
                  width: showUnderstatedButtonsAsCondensed ? 'auto' : '100%',
                }}
              >
                {React.createElement(LoginButton[provider] as LoginButtonComponentType, {
                  // If only understate providers are available, show them in full length
                  size: showUnderstatedButtonsAsCondensed ? 'condensed' : 'full',
                  disabled: requestInProgress,
                })}
              </motion.div>
            ),
          };
        }),
    [filteredProviders, requestInProgress, transition, showUnderstatedButtonsAsCondensed],
  );

  return (
    <>
      <Spacer size={18} orientation="vertical" />

      {(!!amplifiedButtons.length || !!understatedButtons.length) && showUnderstatedButtonsAsCondensed && (
        <>
          <div className={styles.or} aria-hidden="true">
            {i18n.pnp.or.toString()}
          </div>
          <Spacer size={18} orientation="vertical" />
        </>
      )}

      <VerticallyStackedButtons buttons={amplifiedButtons} />

      {showUnderstatedButtonsAsCondensed ? (
        // If emphasized providers are available, show understated providers in condensed, grid arrangement.
        <HorizontallyStackedButtons buttons={understatedButtons} />
      ) : (
        // Otherwise, show understated providers in a full-length, stacked arrangement.
        <VerticallyStackedButtons buttons={understatedButtons} />
      )}
    </>
  );
};

interface ButtonRenderProps {
  buttons: Array<{ key: React.Key; element: React.ReactNode }>;
}

const VerticallyStackedButtons: React.FC<ButtonRenderProps> = props => {
  const { buttons } = props;

  return (
    <>
      {buttons.map((btn, i) => (
        <React.Fragment key={btn.key}>
          {btn.element}
          <Spacer size={12} orientation="vertical" />
        </React.Fragment>
      ))}
    </>
  );
};

const HorizontallyStackedButtons: React.FC<ButtonRenderProps> = props => {
  const { buttons } = props;

  // Special case for 5 buttons exactly: render first row of three, second row of two...
  // All other cases: render rows of up to four...
  const chunkSize = buttons.length === 5 ? 3 : 4;
  const chunk = (arr, size) => {
    const cache: any[] = [];
    const tmp = [...arr];

    if (size <= 0) return cache;
    while (tmp.length) cache.push(tmp.splice(0, size));
    return cache;
  };

  return (
    <>
      {chunk(buttons, chunkSize).map((btns, i) => (
        <React.Fragment key={btns.map(btn => btn.key).join(',')}>
          {i > 0 && <Spacer size={12} orientation="vertical" />}
          <Flex.Row>
            {btns.map(btn => (
              <Flex.Item className={styles.horizontallyStackedButton} key={btn.key}>
                {btn.element}
              </Flex.Item>
            ))}
          </Flex.Row>
        </React.Fragment>
      ))}
    </>
  );
};
