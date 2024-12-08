import React from 'react';
import { render } from '@testing-library/react';
import { TokenFormatter } from './token-formatter';

describe('Token Formatter Tests', () => {
  it('should render default token ETH with five fraction digits', () => {
    const { container } = render(<TokenFormatter value={1.2345678} />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('1.23456 ETH');
  });
  it('should render a fractional BTC amount with a leading 0', () => {
    const { container } = render(<TokenFormatter value={0.12345678} token="BTC" />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('0.12345 BTC');
  });
  it('should render 0 MATIC', () => {
    const { container } = render(<TokenFormatter value={0} token="MATIC" />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('0 MATIC');
  });
  it('should render a lot of DOGE with five fraction digits', () => {
    const { container } = render(<TokenFormatter value={10000.12345678} token="DOGE" />);
    const content = container.querySelector('span')?.textContent;
    expect(content).toEqual('10,000.12345 DOGE');
  });
});
