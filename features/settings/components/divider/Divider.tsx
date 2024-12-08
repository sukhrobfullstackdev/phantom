import React from 'react';

export const Divider = ({ margin = 16 }) => {
  return <div style={{ borderTop: '1px solid var(--silk20)', margin: `${margin}px 0` }} />;
};
