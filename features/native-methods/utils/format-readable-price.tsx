type Params = {
  price: number;
  fixed?: number;
};

export const formatReadablePrice = ({ price, fixed = 2 }: Params) => {
  const minimum = 0.1 ** fixed;

  if (price < minimum || price === 0) {
    return `<$${minimum.toFixed(fixed)}`;
  }

  return `$${price.toFixed(fixed)}`;
};
