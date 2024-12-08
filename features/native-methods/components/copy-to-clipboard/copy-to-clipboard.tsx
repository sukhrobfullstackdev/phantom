import { Flex, Typography } from '@magiclabs/ui';
import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useClipboard } from 'usable-react';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { CheckIcon } from '~/features/native-methods/ui/icons/CheckIcon';
import { Animate } from '../animate/animate';
import { MotionDiv } from '../motion-div/motion-div';

type Props = PropsWithChildren & {
  text: string;
  copied?: React.ReactElement;
  duration?: number;
  color?: string;
};

export const CopyToClipboard = ({ children, text, copied, duration = 2500, color }: Props) => {
  const { mode } = useThemeMode();
  const { copy } = useClipboard();
  const [wasCopied, setWasCopied] = useState(0);

  useEffect(() => {
    if (wasCopied) {
      const timeout = setTimeout(() => {
        setWasCopied(0);
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [wasCopied, setWasCopied]);

  const handleClickAddress = useCallback(() => {
    copy(text);
    setWasCopied(prev => prev + 1);
  }, [copy, text]);

  return (
    <button
      onClick={handleClickAddress}
      aria-label="Copy your wallet address"
      style={{
        all: 'unset',
        cursor: 'pointer',
      }}
    >
      <Animate exitBeforeEnter initial={false}>
        {wasCopied ? (
          <MotionDiv key="copied-to-clipboard" depth={12}>
            {copied ?? (
              <Flex.Row alignItems="center" style={{ gap: '6px' }}>
                <CheckIcon size={16} color={color ?? mode('var(--ink100)', 'white')} />
                <Typography.BodySmall weight="500" color={color ?? mode('var(--ink100)', 'white')}>
                  Copied!
                </Typography.BodySmall>
              </Flex.Row>
            )}
          </MotionDiv>
        ) : (
          <MotionDiv key="copy-text" depth={12}>
            <>{children}</>
          </MotionDiv>
        )}
      </Animate>
    </button>
  );
};
