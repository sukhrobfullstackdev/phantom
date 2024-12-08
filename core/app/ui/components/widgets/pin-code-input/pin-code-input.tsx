/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/no-array-index-key */

import React, { KeyboardEventHandler, ChangeEventHandler, ClipboardEventHandler, MutableRefObject } from 'react';
import styles from './pin-code-input.less';
import { isMobileUserAgent } from '~/app/libs/platform';

type PinCodeInputProps = {
  id: string;
  inputRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  pinNumbers: string[];
  onKeyUp: KeyboardEventHandler<HTMLInputElement>;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onPaste: ClipboardEventHandler<HTMLInputElement>;
  originName?: string;
  autoFocus?: boolean;
};

export const PinCodeInput = ({
  id,
  inputRefs,
  pinNumbers,
  onKeyUp,
  onChange,
  onPaste,
  originName,
  autoFocus = false,
}: PinCodeInputProps) => {
  const isMobile = isMobileUserAgent();
  const formattedOriginName = originName ? `${originName} ` : '';

  return (
    <form className={styles.pinCodeContainer} id={id}>
      {pinNumbers.map((_, i) => (
        <div key={`${id || undefined}-${i}`}>
          <input
            autoFocus={autoFocus && !isMobile && i === 0}
            tabIndex={0}
            ref={el => {
              if (inputRefs?.current) {
                inputRefs.current[i] = el;
              }
            }}
            aria-label={`${formattedOriginName}one time password input ${i + 1}`}
            name={`${formattedOriginName}one time password input ${i + 1}`}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            minLength={1}
            value={pinNumbers[i]}
            // suppress warning because onchange is clunky for usecase
            onChange={onChange}
            onKeyUp={onKeyUp}
            onPaste={onPaste}
            data-id={i}
            id={id ? `${id}-${i}` : undefined}
          />
        </div>
      ))}
    </form>
  );
};
