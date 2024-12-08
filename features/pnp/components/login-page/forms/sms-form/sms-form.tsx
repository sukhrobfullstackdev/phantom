/* eslint-disable react/destructuring-assignment */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ComboBox,
  DuotoneIconDefinition,
  Flex,
  Icon,
  Item,
  Spacer,
  TextField,
  clsx,
  MonochromeIcons,
} from '@magiclabs/ui';
import { Alpha2Code } from 'i18n-iso-countries';
import { PayloadAction } from 'typesafe-actions';
import { Flag } from './flag/flag';
import { i18n } from '~/app/libs/i18n';
import { motion } from '~/app/libs/polyfills/framer-motion';
import { useBouncyTransition } from '../../animations';
import {
  countryCodeOptions,
  CountryCodeOption,
  getCountryMetadata,
  parsePhoneNumber,
  asYouType,
} from './country-metadata';
import { usePreviousNonEmpty } from '~/app/ui/hooks/use-previous-non-empty';

import styles from './sms-form.less';

interface SMSForm {
  phone: string;
  selectedCountryCode: Alpha2Code;
  requestInProgress: boolean;
  doSMSLogin: () => any;
  updatePhoneAction: (value: any) => PayloadAction<any, any>;
  updatePhoneNumberForLoginAction: (value: any) => PayloadAction<any, any>;
  updateCountryCodeAction: (value: any) => PayloadAction<any, any>;
  updateSelectedCountryCodeCallingCodeAction?: (value: any) => PayloadAction<any, any>;
  unsupportedCountryCodes?: string[];
}

/**
 * This component is thicc, complex, and coupled with a few really fragile
 * dependencies inside `@magiclabs/ui`. Please read the comments throughout.
 *
 * We break this component down into one presentation component and a controller component.
 * To be more reusable, Phone number and country Code are passed from the controller
 */
export const SMSForm: React.FC<SMSForm> = ({
  phone,
  selectedCountryCode,
  updatePhoneAction,
  updatePhoneNumberForLoginAction,
  updateCountryCodeAction,
  requestInProgress,
  doSMSLogin,
  updateSelectedCountryCodeCallingCodeAction,
  unsupportedCountryCodes,
}) => {
  // Form state is moved to the controller
  const handlePhoneInputOnChange = useCallback(e => updatePhoneAction(e.target.value), []);

  const transition = useBouncyTransition();

  // Users can select a country code from the dropdown. We also save the most
  // recent, non-empty country code so we can reset the form if a user blurs out
  // of the dropdown.
  const [showCountryCodeSelector, setShowCountryCodeSelector] = useState(false);
  const prevSelectedCountryCode = usePreviousNonEmpty(selectedCountryCode);
  const selectedCountryCallingCode = useMemo(() => {
    const callingCode = getCountryMetadata(selectedCountryCode)?.callingCode;
    if (updateSelectedCountryCodeCallingCodeAction) updateSelectedCountryCodeCallingCodeAction(callingCode);
    return callingCode;
  }, [selectedCountryCode]);

  // As the user types, we automatically update the value to a localized format.
  const asYouTypePhoneNumber = useMemo(() => {
    const parsed = parsePhoneNumber(selectedCountryCode, phone);
    const formatted = asYouType(selectedCountryCode, phone);

    // If the diff between `formatted` and `phone` is ")", then we need this
    // case to enable the user to delete characters from the input, else the
    // "asYouType" formatter simply won't let you.
    const diff = formatted?.split(phone).join('');
    if (diff === ')') {
      return phone;
    }

    return formatted ?? parsed?.nationalNumber?.toString() ?? '';
  }, [phone, selectedCountryCode]);

  useEffect(() => {
    const phoneNumber = parsePhoneNumber(selectedCountryCode, asYouTypePhoneNumber)?.number?.toString() ?? '';
    updatePhoneNumberForLoginAction(phoneNumber);
  }, [selectedCountryCode, asYouTypePhoneNumber]);

  // Submit the form upon pressing enter.
  const handleSubmitOnEnter: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key === 'Enter') {
        doSMSLogin();
      }
    },
    [doSMSLogin],
  );

  // We keep a ref to the phone number input so we can focus it after the user
  // has selected a country code.
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Updates the selected country code when a selection is made from the
  // dropdown.
  const updateCountryCode = useCallback((code: React.Key) => {
    if (code) {
      updateCountryCodeAction(code as Alpha2Code);
      setShowCountryCodeSelector(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, []);

  // Resets the form to the previous country code if the user blurs out of the
  // dropdown.
  const updateCountryCodeOnBlur = useCallback(() => {
    updateCountryCode(selectedCountryCode || prevSelectedCountryCode);
  }, [updateCountryCode, selectedCountryCode, prevSelectedCountryCode]);

  return (
    <div className={styles.SMSLinkForm}>
      {/* This is the phone number input... */}
      {!showCountryCodeSelector && (
        <motion.div key="login-form" layoutId="SmsFormController/login-form" {...transition()}>
          <TextField
            addonBefore={
              <OpenCountryCodeSelector
                selectedCountryCode={selectedCountryCode}
                onClick={() => setShowCountryCodeSelector(true)}
              />
            }
            prefix={
              <div aria-hidden="true">{selectedCountryCallingCode ? `+${selectedCountryCallingCode}` : undefined}</div>
            }
            disabled={requestInProgress}
            placeholder={i18n.pnp.phone_number.toString()}
            value={asYouTypePhoneNumber}
            onKeyPress={handleSubmitOnEnter}
            onChange={handlePhoneInputOnChange}
            autoFocus
            ref={inputRef}
          />
        </motion.div>
      )}

      {/* ...and this one is the country code dropdown/combobox */}
      {showCountryCodeSelector && (
        <motion.div
          className={styles.combobox}
          key="country-code-selector"
          layoutId="SmsFormController/country-code-selector"
          {...transition()}
        >
          <CountryCodeSelector
            selectedCountryCode={selectedCountryCode}
            updateCountryCode={updateCountryCode}
            updateCountryCodeOnBlur={updateCountryCodeOnBlur}
            unsupportedCountryCodes={unsupportedCountryCodes}
          />
        </motion.div>
      )}

      <Spacer size={24} orientation="vertical" />
    </div>
  );
};

const OpenCountryCodeSelector: React.FC<{
  selectedCountryCode: Alpha2Code;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}> = props => {
  const { selectedCountryCode, ...otherProps } = props;
  return (
    <TextField.AddonButton {...otherProps} aria-label={i18n.pnp.select_country_code.toString()}>
      <Flex.Row vertical="center">
        <Flag code={selectedCountryCode} />
        <Spacer size={8} orientation="horizontal" />
        <Icon size={14} type={MonochromeIcons.CaretDown} />
      </Flex.Row>
    </TextField.AddonButton>
  );
};

const CountryCodeSelector: React.FC<{
  selectedCountryCode: Alpha2Code;
  updateCountryCode: (code: React.Key) => void;
  updateCountryCodeOnBlur: () => void;
  unsupportedCountryCodes?: string[];
}> = props => {
  const { selectedCountryCode, updateCountryCode, updateCountryCodeOnBlur, unsupportedCountryCodes } = props;

  const selectedCountryName = useMemo(() => {
    return getCountryMetadata(selectedCountryCode)?.name;
  }, [selectedCountryCode]);

  const filter = useCallback(
    (item: CountryCodeOption, query: string | null) => {
      // If the query is an exact match to the currently selected country, we
      // want to show all other options in alphabetical order beneath the
      // selected country.
      if (query === selectedCountryName) {
        return true;
      }

      // Otherwise, we surface options that start with the given query.
      if (query) {
        return item.searchableName.startsWith(query?.toLowerCase()) || item.callingCode.startsWith(query);
      }

      return false;
    },
    [selectedCountryName],
  );

  // convert unsupported country map from array to object for easier filtering
  const unsupportedCountryMap = (unsupportedCountryCodes || []).reduce((prev, curr) => {
    return { ...prev, [curr]: true };
  }, {});

  const sortedCountryCodeOptions = useMemo(() => {
    return (
      unsupportedCountryCodes?.length
        ? countryCodeOptions.filter(option => !unsupportedCountryMap[option.callingCode])
        : countryCodeOptions
    ).sort((a, b) => {
      if (a.key === selectedCountryCode) {
        return -1;
      }

      return 0;
    });
  }, [selectedCountryCode]);

  return (
    <Flex.Column>
      {/* Making a combobox completely sucks btw... */}
      <ComboBox<CountryCodeOption>
        size="md"
        aria-label={i18n.pnp.select_country_code.toString()}
        menuTrigger="focus"
        showSearchIcon
        menuMinHeight={200}
        menuMaxHeight={200}
        filter={filter}
        items={sortedCountryCodeOptions}
        onSelectionChange={updateCountryCode}
        onBlur={updateCountryCodeOnBlur}
        defaultSelectedKey={selectedCountryCode}
        defaultInputValue={getCountryMetadata(selectedCountryCode)?.name}
        placeholder={i18n.pnp.search_country_codes.toString()}
        autoFocus
        autoSelect
      >
        {/*
          How this works:
          We use `react-aria` under-the hood, which has a concept of
          "collections", which are just fancy hooks to manage list-based data in
          React. The render function given here essentially maps over the data
          given to the `items` prop of <ComboBox>. The `textValue` is effectively
          the `aria-label` for the item. The `key` is the country's calling
          code, which we save into the form state.
          When a selection is made, either by the user blurring the <ComboBox>
          or by selecting an option from the listbox menu, we un-render the
          <ComboBox> and re-focus the user on the phone number input. This took
          a long, long time to figure out and might be quite brittle.
          Please avoid changing this code.
          */}
        {item => (
          <Item key={item.key} textValue={item.name}>
            <CountryCodeSelectorItem item={item} />
          </Item>
        )}
      </ComboBox>
    </Flex.Column>
  );
};

const CountryCodeSelectorItem: React.FC<{ item: CountryCodeOption }> = props => {
  const { item } = props;

  const { isSelected } = ComboBox.useOption();

  return (
    <Flex.Row vertical="center" className={styles.CountryCodeSelectorItem}>
      {isSelected && <Icon.Duotone size={16} type={filledCheckmark} />}
      {!isSelected && <Flag code={item.key} />}
      <Spacer size={12} orientation="horizontal" />
      <Flex.Item grow={1}>{item.name}</Flex.Item>
      <Flex.Item aria-hidden="true" className={clsx(styles.callingCode, isSelected && styles.selected)}>
        +{item.callingCode}
      </Flex.Item>
    </Flex.Row>
  );
};

const filledCheckmark: DuotoneIconDefinition = {
  SVGContents: ({ fillA, fillB }) => {
    return (
      <>
        <rect width="16" height="16" rx="8" {...fillA} />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.1549 4.80171C12.3475 4.98924 12.3574 5.29554 12.1772 5.49509L6.90054 11.339C6.702 11.5589 6.35688 11.5589 6.15833 11.339L3.82276 8.75237C3.64258 8.55282 3.65245 8.24652 3.84511 8.05899L4.03993 7.86935C4.24307 7.67162 4.5698 7.68215 4.75979 7.89256L6.52944 9.85244L11.2402 4.63528C11.4302 4.42487 11.7569 4.41434 11.9601 4.61207L12.1549 4.80171Z"
          {...fillB}
        />
      </>
    );
  },

  viewbox: [0, 0, 16, 16],

  colorA: theme => theme.hex.secondary.base,
  colorB: theme => theme.hex.primary.base,
};
