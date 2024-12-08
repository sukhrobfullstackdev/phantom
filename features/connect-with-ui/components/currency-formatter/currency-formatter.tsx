import React, { useEffect, useState } from 'react';
import { getParsedQueryParams } from '~/app/libs/query-params';

interface CurrencyFormatterProps {
  value: number;
  currency?: string;
  locale?: string;
}

export const formatParts = (parts, fractionDigits) => {
  if (!parts) return '';

  return parts
    ?.map(({ type, value }) => {
      if (type !== 'fraction' || !value || value.length < fractionDigits) {
        return value;
      }

      return value.slice(0, fractionDigits);
    })
    .reduce((string, part) => `${string}${part}`);
};

export const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({
  value,
  currency,
  locale,
}: CurrencyFormatterProps) => {
  const [formattedValue, setFormattedValue] = useState('');

  useEffect(() => {
    setFormattedValue(
      formatParts(
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 3,
        }).formatToParts(value),
        2,
      ),
    );
  }, [value, currency, locale]);

  return <span>{value > 0 && formattedValue === `$0.00` ? '<$0.01' : formattedValue}</span>;
};

CurrencyFormatter.defaultProps = {
  currency: 'USD',
  locale: getParsedQueryParams().locale || 'en-US',
};
