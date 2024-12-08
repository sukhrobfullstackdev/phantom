import { BigNumber } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';

type Params = {
  ether: BigNumber | string;
  quantity?: number;
  fixed?: number;
};

export const formatReadableEther = ({ ether, quantity = 1, fixed = 4 }: Params) => {
  let bnEther: BigNumber;
  if (typeof ether === 'string') {
    bnEther = parseEther(ether).mul(quantity);
  } else {
    bnEther = ether.mul(quantity);
  }
  const bnMinimum = parseEther('1').div(BigNumber.from(10).pow(fixed));

  if (bnEther.lt(bnMinimum) || bnEther.isZero()) {
    return `<${Number(formatEther(bnMinimum)).toFixed(fixed)}`;
  }

  return Number(formatEther(bnEther)).toFixed(fixed);
};
