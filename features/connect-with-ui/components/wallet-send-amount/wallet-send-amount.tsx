import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Flex, Icon, Skeleton, Spacer, TextField, Typography } from '@magiclabs/ui';
import { ArrowSwap } from '~/shared/svg/magic-connect';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { useGetTokenPrice } from '../../hooks/useGetTokenPrice';
import { useGetNativeTokenBalance } from '../../hooks/useGetNativeTokenBalance';
import { formatParts } from '../currency-formatter/currency-formatter';
import { getParsedQueryParams } from '~/app/libs/query-params';
import styles from './wallet-send-amount.less';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import LedgerBalance from '~/app/libs/ledger-balance';
import { ethDecimalsToUnit } from '../../utils/transaction-type-utils';

const SetMaxAmount: React.FC<{
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  color: string;
}> = props => {
  const { color, ...otherProps } = props;
  return (
    <TextField.AddonButton {...otherProps} style={{ width: '55px', color }}>
      <Typography.BodySmall weight="600">Max</Typography.BodySmall>
    </TextField.AddonButton>
  );
};

// TODO: we shouldn't format to locale since the price feed is always in USD
const fiatFormatter = (locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
};

const tokenFormatter = (locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 6,
    maximumFractionDigits: 20,
  });
};

const formatFiat = (formatter: Intl.NumberFormat, value: number) => {
  return formatParts(formatter.formatToParts(value), 2);
};

const formatToken = (formatter: Intl.NumberFormat, value: number) => {
  return formatParts(formatter.formatToParts(value), 7);
};

interface WalletSendAmountProps {
  onChangeSendAmountHandler: ({ value, isValid }) => void;
  networkFee: number;
  isLoading: boolean;
  decimals?: number;
  balance?: string;
  symbol?: string;
  contractAddress?: string;
  isInputFormatFiat: boolean;
  errorMessage: string;
  isSendFlowUsdc?: boolean;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsInputFormatFiat: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WalletSendAmount = ({
  onChangeSendAmountHandler,
  errorMessage,
  setErrorMessage,
  networkFee,
  isLoading,
  decimals,
  balance,
  symbol,
  contractAddress,
  isInputFormatFiat,
  isSendFlowUsdc,
  setIsInputFormatFiat,
}: WalletSendAmountProps) => {
  const [maxFiatAmount, setMaxFiatAmount] = useState('');
  const [maxTokenAmount, setMaxTokenAmount] = useState('');
  const price: string = useGetTokenPrice() || '';
  const balanceData: string = useGetNativeTokenBalance() || '';
  const { theme } = useTheme();

  const [formattedInputValue, setFormattedInputValue] = useState('');
  const [formattedAltValue, setFormattedAltValue] = useState('');

  const locale = getParsedQueryParams().locale || 'en-US';
  const chainInfo = useContext(MultiChainInfoContext);
  const fiatFormatterInst = fiatFormatter(locale);
  const tokenFormatterInst = tokenFormatter(locale);
  const ledgerBalance = new LedgerBalance();

  const setAmountToMax = useCallback(() => {
    if (isInputFormatFiat) {
      setFormattedInputValue(maxFiatAmount);
      setFormattedAltValue(maxTokenAmount);
    } else {
      setFormattedInputValue(maxTokenAmount);
      setFormattedAltValue(maxFiatAmount);
    }
  }, [maxFiatAmount, maxTokenAmount, formattedInputValue, isInputFormatFiat]);

  const sanitizeInput = (string: string, regex: RegExp, replaceWith: string): string => {
    return string.replace(regex, replaceWith);
  };

  useEffect(() => {
    const maxSendInFiat = ledgerBalance.maxSendInFiat()(balanceData, price, networkFee);
    setMaxFiatAmount(sanitizeInput(formatFiat(fiatFormatterInst, maxSendInFiat), /[^0-9.]/g, ''));
    const formattedMaxSendInFiat = sanitizeInput(formatFiat(fiatFormatterInst, maxSendInFiat), /[^0-9.]/g, '');
    const maxSendEthAmount = sanitizeInput(
      formatToken(tokenFormatterInst, Number(formattedMaxSendInFiat) / Number(price)),
      /[^0-9.]/g,
      '',
    );
    let maxTokenAmountLocal = maxSendEthAmount;
    if (contractAddress)
      maxTokenAmountLocal = Number(
        ethers.utils.formatUnits(balance || '0', ethDecimalsToUnit[decimals || 18] || 'ether'),
      ).toString();
    if (isSendFlowUsdc && balance) maxTokenAmountLocal = balance;
    setMaxTokenAmount(maxTokenAmountLocal);
  }, [balanceData, networkFee]);

  const onChangeHandler = useCallback(
    event => {
      event.preventDefault();
      const sanitizedInput = sanitizeInput(event.target.value.toString(), /[^0-9.]/g, '');
      if (isInputFormatFiat) {
        // if ends with . remove the . for calculations
        if (sanitizedInput.endsWith('.')) {
          setFormattedAltValue(
            formatToken(tokenFormatterInst, Number(sanitizedInput.replace('.', '')) / Number(price)),
          );
          return setFormattedInputValue(sanitizedInput);
        }
        // if exactly one decimal places convert to cents by removing decimal place
        if (/^\d+\.\d{1,1}$/.exec(sanitizedInput)) {
          setFormattedAltValue(
            formatToken(tokenFormatterInst, Number(sanitizedInput.replace('.', '')) / Number(price) / 10),
          );
          return setFormattedInputValue(sanitizedInput);
        }
        // if exactly two decimal places convert to cents by removing decimal place
        if (/^\d+\.\d{2,2}$/.exec(sanitizedInput)) {
          setFormattedAltValue(
            formatToken(tokenFormatterInst, Number(sanitizedInput.replace('.', '')) / Number(price) / 100),
          );
          return setFormattedInputValue(sanitizedInput);
        }
        // strip anything beyond 2 decimal places
        if (/^\d+\.\d{2,}$/.exec(sanitizedInput)) {
          const [integerPart, decimalPart] = sanitizedInput.split('.');
          const formattedInput = `${integerPart}.${decimalPart.slice(0, 2)}`;

          setFormattedAltValue(
            formatToken(
              tokenFormatterInst,
              Number(sanitizeInput(formattedInput, /[^0-9-.]/g, '').replace('.', '')) / Number(price) / 100,
            ),
          );
          return setFormattedInputValue(sanitizeInput(formattedInput, /[^0-9-.]/g, ''));
        }
        setFormattedAltValue(formatToken(tokenFormatterInst, Number(sanitizedInput) / Number(price)));
        setFormattedInputValue(sanitizedInput);
      } else {
        if (/^\d+\.\d{7,}$/.exec(sanitizedInput)) {
          const [integerPart, decimalPart] = sanitizedInput.split('.');
          setFormattedAltValue(formatFiat(fiatFormatterInst, Number(sanitizedInput) * Number(price)));
          return setFormattedInputValue(sanitizeInput(`${integerPart}.${decimalPart.slice(0, 6)}`, /[^0-9-.]/g, ''));
        }
        if (sanitizedInput.endsWith('.')) {
          const [integerPart] = sanitizedInput.split('.');
          setFormattedAltValue(formatFiat(fiatFormatterInst, Number(integerPart) * Number(price)));
          return setFormattedInputValue(sanitizeInput(`${integerPart}.`, /[^0-9-.]/g, ''));
        }
        const [integerPart, decimalPart] = sanitizedInput.split('.');
        setFormattedAltValue(formatFiat(fiatFormatterInst, Number(sanitizedInput) * Number(price)));
        return setFormattedInputValue(
          sanitizeInput(`${integerPart}${decimalPart ? '.' : ''}${decimalPart?.slice(0, 6) || ''}`, /[^0-9-.]/g, ''),
        );
      }
    },
    [isInputFormatFiat, formattedAltValue],
  );

  const toggleInputType = useCallback(() => {
    setIsInputFormatFiat(!isInputFormatFiat);
    setFormattedInputValue(formattedAltValue);
    setFormattedAltValue(formattedInputValue);
  }, [formattedAltValue, formattedInputValue, isInputFormatFiat, setIsInputFormatFiat]);

  useEffect(() => {
    // ERC20 tokens
    if (contractAddress) {
      if (
        formattedInputValue &&
        Number(formattedInputValue) >
          Number(ethers.utils.formatUnits(balance || '0', ethDecimalsToUnit[decimals || 18] || 'ether'))
      ) {
        return setErrorMessage(`Insufficient funds.`);
      }
      if (formattedInputValue && Number(formattedInputValue) <= 0) {
        return setErrorMessage('Amount must be greater than 0');
      }
      setErrorMessage('');
      return onChangeSendAmountHandler({
        value: ledgerBalance.formatSendAmount(formattedInputValue, decimals),
        isValid: !errorMessage.length && !!formattedInputValue,
      });
    }

    // Flow USDC
    if (isSendFlowUsdc) {
      if (formattedInputValue && Number(formattedInputValue) > Number(balance)) {
        return setErrorMessage(`Insufficient funds.`);
      }
      if (formattedInputValue && Number(formattedInputValue) <= 0) {
        return setErrorMessage('Amount must be greater than 0');
      }
      setErrorMessage('');
      return onChangeSendAmountHandler({
        value: ledgerBalance.formatSendAmount(formattedInputValue, decimals),
        isValid: !errorMessage.length && !!formattedInputValue,
      });
    }

    // Native tokens
    if (!contractAddress && !isSendFlowUsdc) {
      if (isInputFormatFiat && Number(formattedInputValue) > Number(maxFiatAmount)) {
        return setErrorMessage(
          `Insufficient funds. $${maxFiatAmount} (${maxTokenAmount} ${chainInfo?.currency}) available after network fee.`,
        );
      }
      if (
        typeof formattedInputValue === 'undefined' ||
        (typeof formattedInputValue === 'string' && !formattedInputValue.length)
      ) {
        return setErrorMessage('');
      }
      if (Number(formattedInputValue) <= 0) {
        return setErrorMessage('Amount must be greater than 0');
      }
      if (!isInputFormatFiat && Number(formattedInputValue) > Number(maxTokenAmount)) {
        return setErrorMessage(
          `Insufficient funds. ${maxTokenAmount} ${chainInfo?.currency} ($${maxFiatAmount}) available after network fee.`,
        );
      }
      setErrorMessage('');
      onChangeSendAmountHandler({
        value: isInputFormatFiat
          ? ledgerBalance.getSendAmount(formattedAltValue)
          : ledgerBalance.getSendAmount(formattedInputValue),
        isValid: !errorMessage.length,
      });
    }
    if (Number(formattedInputValue) <= 0) {
      return setErrorMessage('Amount must be greater than 0');
    }
    if (!isInputFormatFiat && Number(formattedInputValue) > Number(maxTokenAmount)) {
      return setErrorMessage(
        `Insufficient funds. ${maxTokenAmount} ${chainInfo?.currency} ($${maxFiatAmount}) available after network fee.`,
      );
    }
    setErrorMessage('');
    onChangeSendAmountHandler({
      value: isInputFormatFiat
        ? ledgerBalance.getSendAmount(formattedAltValue)
        : ledgerBalance.getSendAmount(formattedInputValue),
      isValid: !errorMessage.length,
    });
  }, [isInputFormatFiat, formattedInputValue, formattedAltValue, networkFee, errorMessage]);

  const altDisplayValue = () =>
    `${!isInputFormatFiat ? '$' : ''}${formattedAltValue || '0'} ${isInputFormatFiat ? chainInfo?.currency : ''}`;

  return (
    <>
      {isLoading && (
        <Flex.Column alignItems="flex-start">
          <Skeleton shape="pill" height="24px" width="60px" />
          <Spacer size={19} orientation="vertical" />
          <Skeleton shape="pill" height="24px" width="200px" />
          <Spacer size={46} orientation="vertical" />
        </Flex.Column>
      )}

      {!isLoading && (
        <div className={styles.walletSendAmount}>
          <Typography.BodySmall style={{ textAlign: 'left' }}>Amount</Typography.BodySmall>
          <Spacer size={8} orientation="vertical" />
          <TextField
            onChange={onChangeHandler}
            value={formattedInputValue}
            type="number"
            placeholder={isInputFormatFiat ? '0.00' : '0'}
            errorMessage={errorMessage}
            prefix={isInputFormatFiat ? '$' : ''}
            suffix={!isInputFormatFiat ? symbol || chainInfo?.currency : ''}
            addonAfter={<SetMaxAmount onClick={setAmountToMax} color={theme.hex.primary.base} />}
          />
          <Spacer size={8} orientation="vertical" />
          {!contractAddress && !isSendFlowUsdc && (
            <Flex.Row>
              <Icon
                style={{ cursor: 'pointer' }}
                size={24}
                type={ArrowSwap}
                color={theme.hex.primary.base}
                onClick={toggleInputType}
              />
              <Spacer size={8} orientation="horizontal" />
              <Typography.BodySmall
                color={theme.isDarkTheme ? '#B6B4BA' : '#77767A'}
                weight="400"
                style={{ textAlign: 'left' }}
              >
                {altDisplayValue()}
              </Typography.BodySmall>
            </Flex.Row>
          )}
        </div>
      )}
    </>
  );
};

export default WalletSendAmount;

WalletSendAmount.defaultProps = {
  contractAddress: '',
  isSendFlowUsdc: false,
  symbol: '',
  balance: '',
  decimals: 18,
};
