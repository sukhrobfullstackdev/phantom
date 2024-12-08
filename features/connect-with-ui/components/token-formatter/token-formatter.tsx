import React, { useEffect, useState } from 'react';
import { getParsedQueryParams } from '~/app/libs/query-params';

const formatParts = (parts, fractionDigits) => {
  return parts
    .map(({ type, value }) => {
      if (type !== 'fraction' || !value || value.length < fractionDigits) {
        return value;
      }

      return value.slice(0, fractionDigits);
    })
    .reduce((string, part) => `${string}${part}`);
};

interface TokenFormatterProps {
  value: number;
  token?: string;
  locale?: string;
}

export const TokenFormatter = ({ value = 0, token, locale }: TokenFormatterProps) => {
  const [formattedValue, setFormattedValue] = useState('');

  useEffect(() => {
    setFormattedValue(
      formatParts(
        new Intl.NumberFormat(locale, {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 20,
        }).formatToParts(value),
        5,
      ),
    );
  }, [value, token, locale]);

  return <span>{`${value > 0 && formattedValue === '0.00000' ? `<0.00001` : formattedValue} ${token}`}</span>;
};

TokenFormatter.defaultProps = {
  token: 'ETH',
  locale: getParsedQueryParams().locale || 'en-US',
};
