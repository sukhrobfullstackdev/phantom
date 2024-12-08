import React, { useRef, useState } from 'react';
import { PinCodeInput } from './pin-code-input';

const REGEX_NUMBER_CLEANER = /\D/g;

export const usePinCode = ({
  pinLength = 6,
  onComplete = (pin: string) => {},
  onChange = (pins: Array<string>) => {},
  id = 'pin-code-input',
} = {}) => {
  const [pinNumbers, setPinNumbers] = useState(new Array<string>(pinLength).fill(''));
  const inputRefs = useRef(new Array(pinLength));

  const clearPinCodeInput = () => {
    setPinNumbers(new Array<string>(pinLength).fill(''));
    inputRefs?.current?.[0]?.focus();
  };

  const focusForm = () => {
    inputRefs?.current?.[0]?.focus();
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentIndex = parseInt(e.currentTarget.dataset.id as string, 10);
    if (e.key === 'Backspace' && currentIndex >= 0) {
      const newPins = [...pinNumbers];
      newPins[currentIndex] = '';
      setPinNumbers(newPins);
      onChange(newPins);
      if (currentIndex > 0) inputRefs?.current[currentIndex - 1].focus();
      return;
    }
  };

  // onChange for input
  const onChangeProp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentIndex = parseInt(e.currentTarget.dataset.id as string, 10);
    if (pinNumbers[currentIndex]) {
      bulkUpdatePincode(currentIndex, e.target.value.substr(-1));
    } else {
      bulkUpdatePincode(currentIndex, e.target.value);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const currentIndex = parseInt(e.currentTarget.dataset.id as string, 10);
    bulkUpdatePincode(currentIndex, e.clipboardData.getData('Text'));
  };

  const bulkUpdatePincode = (i: number, text: string) => {
    let currentIndex = i;
    const newPins = [...pinNumbers];
    text
      .replace(REGEX_NUMBER_CLEANER, '')
      .split('')
      .forEach(code => {
        if (currentIndex >= pinLength) {
          return;
        }
        newPins[currentIndex] = code;
        currentIndex++;
        inputRefs?.current?.[currentIndex]?.focus();
      });
    setPinNumbers(newPins);
    onChange(newPins);

    // onComplete if we are done
    const pin = newPins.join('');
    if (currentIndex === pinLength && pin.length === pinLength) {
      inputRefs.current[currentIndex - 1].blur();
      onComplete(pin);
    }
  };

  const pinCodeInputProps = {
    onPaste,
    id,
    inputRefs,
    pinNumbers,
    onKeyUp,
    onChange: onChangeProp,
  };

  return {
    PinCodeInput,
    pinCodeInputProps,
    clearPinCodeInput,
    focusForm,
  };
};
