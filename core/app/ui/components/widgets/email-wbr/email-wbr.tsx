import React from 'react';

export const EmailWbr = ({ email }) => {
  const emailSplit = email.split('@');
  return (
    <>
      <p style={{ wordBreak: 'break-all' }}>{emailSplit[0]}</p>
      <wbr />@{emailSplit[1]}
    </>
  );
};
