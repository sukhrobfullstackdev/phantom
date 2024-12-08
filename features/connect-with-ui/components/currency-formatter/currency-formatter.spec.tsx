import React from 'react';
import { render } from '@testing-library/react';
import { CurrencyFormatter } from './currency-formatter';

describe('Currency Formatter Tests', () => {
  it('should render $0.00', () => {
    const { container } = render(<CurrencyFormatter value={0} />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('$0.00');
  });
  it('should round down to $1.23', () => {
    const { container } = render(<CurrencyFormatter value={1.235} />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('$1.23');
  });
  it('should render $0.12', () => {
    const { container } = render(<CurrencyFormatter value={0.125} />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('$0.12');
  });
  it('should round up to $0.12', () => {
    const { container } = render(<CurrencyFormatter value={0.125} />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('$0.12');
  });
  it('should round up to $0.12', () => {
    const { container } = render(<CurrencyFormatter value={0.125} />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('$0.12');
  });
  it('should display German Euros', () => {
    const { container } = render(<CurrencyFormatter value={0.125} currency="EUR" locale="de-DE" />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('0,12 €');
  });
  it('should display Nigerian Yoruba', () => {
    const { container } = render(<CurrencyFormatter value={0.125} currency="NGN" locale="yo-NG" />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('₦0.12');
  });
  it('should display Vietnamese Dong', () => {
    const { container } = render(<CurrencyFormatter value={1.125} currency="VND" locale="vi-VN" />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toBe('1,12 ₫');
  });
});
