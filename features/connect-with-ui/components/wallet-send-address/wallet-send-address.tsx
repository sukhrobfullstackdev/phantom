import { TextField, Typography, Spacer, Skeleton, Flex } from '@magiclabs/ui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import LedgerBalance from '~/app/libs/ledger-balance';

interface WalletSendAddressProps {
  onChangeWalletAddressHandler: ({ address, isValid }: { address: string; isValid: boolean }) => void;
  isLoading: boolean;
}
export const WalletSendAddress = ({ onChangeWalletAddressHandler, isLoading }: WalletSendAddressProps) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onChangeHandler = useCallback(
    e => {
      setWalletAddress(e.target.value);
    },
    [walletAddress],
  );

  useEffect(() => {
    try {
      if (walletAddress?.length) {
        const ledgerBalance = new LedgerBalance();
        const isAddressValid = ledgerBalance.verifyAddress()(walletAddress);
        if (isAddressValid) {
          onChangeWalletAddressHandler({ address: walletAddress, isValid: isAddressValid });
          setErrorMessage('');
        } else {
          onChangeWalletAddressHandler({ address: walletAddress, isValid: false });
          setErrorMessage(`Please enter a valid ${chainInfo?.name} address (e.g. 0x123...)`);
        }
      } else {
        setErrorMessage('');
      }
    } catch (e) {
      onChangeWalletAddressHandler({ address: walletAddress, isValid: false });
      setErrorMessage(`Please enter a valid ${chainInfo?.name} address (e.g. 0x123...)`);
    }
  }, [walletAddress]);

  return (
    <>
      {isLoading && (
        <Flex.Column alignItems="flex-start">
          <Skeleton shape="pill" height="24px" width="60px" />
          <Spacer size={19} orientation="vertical" />
          <Skeleton shape="pill" height="24px" width="200px" />
          <Spacer size={11} orientation="vertical" />
        </Flex.Column>
      )}

      {!isLoading && (
        <>
          <Typography.BodySmall style={{ textAlign: 'left' }}>Send to</Typography.BodySmall>
          <Spacer size={8} orientation="vertical" />
          <TextField
            onChange={onChangeHandler}
            value={walletAddress}
            type="text"
            placeholder={`${chainInfo?.name} wallet address`}
            errorMessage={errorMessage}
          />
        </>
      )}
    </>
  );
};

export default WalletSendAddress;
