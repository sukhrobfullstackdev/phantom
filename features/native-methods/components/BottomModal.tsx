import React, { HTMLAttributes, PropsWithChildren } from 'react';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useIsTrialMode } from '../hooks/useIsTrialMode';
import { Flex } from '@magiclabs/ui';
import { MotionProps, motion } from 'framer-motion';
import { useThemeMode } from '../hooks/useThemeMode';
import { Animate } from './animate/animate';

export type BottomModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
}>;

const Overlay = ({
  isTrialMode,
  ...rest
}: MotionProps &
  HTMLAttributes<HTMLDivElement> & {
    isTrialMode: boolean;
  }) => (
  <motion.div
    style={{
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: isTrialMode ? '0 0 28px 28px' : '28px',
      zIndex: 30,
    }}
    {...rest}
  />
);

const Modal = (props: MotionProps & HTMLAttributes<HTMLDivElement>) => {
  const { mode } = useThemeMode();

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: '16px',
        right: '16px',
        bottom: '16px',
        backgroundColor: mode('white', 'var(--slate2)'),
        borderRadius: '18px',
        zIndex: '10000',
      }}
      {...props}
    />
  );
};

const ModalWrapper = (props: HTMLAttributes<HTMLDivElement>) => (
  <Flex.Column
    alignItems="center"
    style={{
      position: 'relative',
      padding: '36px 28px 32px',
    }}
    {...props}
  />
);

export const BottomModal = ({ isOpen, onClose, children }: BottomModalProps) => {
  const { isTrialMode } = useIsTrialMode();

  return (
    <Animate exitBeforeEnter>
      {isOpen && (
        <>
          <Overlay
            isTrialMode={isTrialMode}
            onClick={onClose}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: {
                ease: 'easeOut',
                duration: 0.15,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                ease: 'easeIn',
                duration: 0.15,
              },
            }}
          />
          <Modal
            initial={{
              opacity: 0,
              scale: 0.75,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                ease: 'easeOut',
                duration: 0.15,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.75,
              transition: {
                ease: 'easeIn',
                duration: 0.15,
              },
            }}
          >
            <ModalWrapper>
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                }}
              >
                <CancelActionButton onClick={onClose} />
              </div>
              {children}
            </ModalWrapper>
          </Modal>
        </>
      )}
    </Animate>
  );
};
