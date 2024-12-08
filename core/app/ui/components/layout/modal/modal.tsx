import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { motion, AnimatePresence, AnimationProps, MotionAdvancedProps } from 'framer-motion';
import { useEffectAfterMount } from 'usable-react';
import { Flex, mergeProps, Spacer } from '@magiclabs/ui';
import { useScale, useFade } from '~/app/ui/hooks/transitions';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { SecuredByMagic } from '../../widgets/secured-by-magic';
import { useUIThreadActions, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { shouldShowMagicLogo } from '~/app/libs/theme';
import { isMagicWalletDapp } from '~/app/libs/connect-utils';

import styles from './modal.less';
import { TrialModeBanner, getIsTrialMode } from '../../widgets/trial-mode-banner';

interface ModalProps {
  in?: boolean;
  noAnimation?: boolean;
  onExitComplete?: () => void;
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  debugSlot?: React.ReactNode;
  obfuscateBackground?: boolean;
  children: React.ReactNode;
}

/**
 * Coordinate modal background/foreground exit animations via a React hook.
 */
function useCoordinatedModalAnimations(props: ModalProps) {
  const [backgroundExited, setBackgroundExited] = useState(!props.in);
  const [foregroundExited, setForegroundExited] = useState(!props.in);

  useEffect(() => {
    if (props.in) {
      setBackgroundExited(false);
      setForegroundExited(false);
    }
  }, [props.in]);

  useEffectAfterMount(() => {
    if (backgroundExited && foregroundExited) props.onExitComplete!();
  }, [backgroundExited, foregroundExited]);

  return {
    backgroundExited: useCallback(() => setBackgroundExited(true), []),
    foregroundExited: useCallback(() => setForegroundExited(true), []),
  };
}

const BaseModal: React.FC<ModalProps> = props => {
  const { in: inProp, noAnimation, onBackgroundClick, obfuscateBackground, debugSlot, children } = props;

  const getFadeProps = useFade();
  const getScaleProps = useScale();
  const payload = useUIThreadPayload();
  const { theme } = useTheme();

  const { backgroundExited, foregroundExited } = useCoordinatedModalAnimations(props);

  const noopAnimationProps: AnimationProps & MotionAdvancedProps = { exit: {} };
  const scaleProps = noAnimation ? noopAnimationProps : getScaleProps(0.9);
  const fadeProps = noAnimation ? noopAnimationProps : getFadeProps();
  const showMagicLogo = shouldShowMagicLogo(theme.customBrandingType);
  const [showTrialmodeBanner, setShowTrialmodeBanner] = useState(false);

  useEffect(() => {
    setShowTrialmodeBanner(payload ? getIsTrialMode(payload?.method) : false);
  }, []);

  return (
    <div className={styles.Modal}>
      {/* Background */}
      <AnimatePresence onExitComplete={backgroundExited}>
        {inProp && obfuscateBackground && (
          <motion.div
            key={0}
            className={isMagicWalletDapp() ? styles.transparentBackground : styles.blurredBackground}
            onClick={onBackgroundClick}
            {...fadeProps}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
      {/* Foreground */}
      <AnimatePresence onExitComplete={foregroundExited} custom={scaleProps.custom}>
        {inProp && (
          <Fragment key={0}>
            {showTrialmodeBanner && (
              <motion.div key={1} {...scaleProps} transition={{ delay: 0, duration: 0.15 }} id="trial-mode-banner">
                <TrialModeBanner />
              </motion.div>
            )}
            <motion.div
              key={0}
              className={`${styles.contentWrapper} ${showTrialmodeBanner ? styles.overrideTopBorderRadius : ''}`}
              {...scaleProps}
              transition={{ delay: 0, duration: 0.15 }}
              id="magic-modal"
            >
              <Flex.Column className={styles.content}>
                {/* we just use some divs and child selectors to get this working */}
                <div>
                  <div>
                    <div>{children}</div>
                  </div>
                  {showMagicLogo && (
                    <motion.div key="footer">
                      <Spacer size={40} orientation="vertical" />
                      <SecuredByMagic faded small />
                    </motion.div>
                  )}
                </div>
                <Spacer size={32} orientation="vertical" style={{ zIndex: '-1' }} />
              </Flex.Column>
            </motion.div>
          </Fragment>
        )}

        {/* Ensures at least 48px of scrollable space below the content card */}
        <div className={styles.belowContentSpacer} />

        {!!debugSlot && (
          <div className={styles.debugSlot}>
            <div>{debugSlot}</div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

BaseModal.displayName = 'BaseModal';

BaseModal.defaultProps = {
  in: false,
  noAnimation: false,
  obfuscateBackground: true,
  onExitComplete: () => {},
  onBackgroundClick: () => {},
};

type RpcModalProps = Omit<ModalProps, 'in'>;

const RpcModal: React.FC<RpcModalProps> = props => {
  const { children, ...otherProps } = props;

  const { showUI, hideOverlay } = useUIThreadActions();

  return <BaseModal {...mergeProps({ in: showUI, onExitComplete: hideOverlay }, otherProps)}>{children}</BaseModal>;
};

RpcModal.displayName = 'RpcModal';

RpcModal.defaultProps = {
  noAnimation: false,
  onExitComplete: () => {},
  onBackgroundClick: () => {},
};

export const Modal = Object.assign(BaseModal, { RPC: RpcModal });
