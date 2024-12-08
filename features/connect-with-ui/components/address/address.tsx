import React from 'react';

export const Address = ({ address }) => {
  return <span>{`${address?.slice(0, 5)}...${address?.slice(-4)}`}</span>;
};
