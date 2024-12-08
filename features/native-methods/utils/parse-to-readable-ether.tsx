import { BigNumber as BN } from 'bignumber.js';

type Params = {
  amount: BN.Value | string;
  fixed?: number;
  unit?: number;
};

export const parseInReadableEther = ({ amount, fixed = 4, unit = 18 }: Params) => {
  const bnAmount = new BN(amount);
  const bnMinimum = new BN(0.1).pow(fixed);
  const bnUnit = new BN(10).pow(unit);

  const parsed = bnAmount.dividedBy(bnUnit);

  return parsed.gt(bnMinimum) || parsed.isZero() ? parsed.toFixed(fixed) : `<${bnMinimum.toString()}`;
};
