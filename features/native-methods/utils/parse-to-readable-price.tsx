import { BigNumber as BN } from 'bignumber.js';

type Params = {
  amount: BN.Value | string;
  price: BN.Value | string;
  fixed?: number;
  unit?: number;
};

export const parseInReadablePrice = ({ amount, price, fixed = 2, unit = 18 }: Params) => {
  const bnAmount = new BN(amount);
  const bnPrice = new BN(price);
  const bnMinimum = new BN(0.1).pow(fixed);
  const bnUnit = new BN(10).pow(unit);

  const bnTotalPrice = bnAmount.multipliedBy(bnPrice).dividedBy(bnUnit);

  return bnTotalPrice.gt(bnMinimum) || bnTotalPrice.isZero()
    ? `$${bnTotalPrice.toFixed(fixed)}`
    : `<$${bnMinimum.toString()}`;
};
