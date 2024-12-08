import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { PayPalHostedFieldsProvider, usePayPalHostedFields } from '@paypal/react-paypal-js';
import { NFTService } from '~/app/services/nft/nft-service';
import { NFT_CHECKOUT_TYPES, useNFTCheckoutType } from '../../hooks/use-nft-checkout-type';
import { useNFTPaypalCheckoutState } from '../../hooks/use-nft-paypal-checkout-state';
import { useForm } from 'react-hook-form';
import { vestResolver } from '@hookform/resolvers/vest';
import { getLogger } from '~/app/libs/datadog';
import { create, enforce, test } from 'vest';
import { i18n } from '~/app/libs/i18n';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { includes } from '~/app/libs/lodash-utils';
import { CARD_TYPES } from '../../constants';
import { TextField } from '~/features/native-methods/ui/text-filed/text-filed';
import { CustomPaypalHostedField } from '../../components/CustomPaypalHostedField';
import { CardIconSelector } from '../../components/CardIconSelector';
import { Button } from '~/features/native-methods/ui/button/button';
import { NFT_ERROR_TYPES, useNFTError } from '~/features/native-methods/hooks/use-nft-error';

type FormData = {
  fullLegalName: string;
  zipCode: string;
  cardType: string;
};

const validationSuite = create(({ zipCode, fullLegalName }: FormData) => {
  test('zipCode', i18n.nft_checkout.zip_code_empty.toString(), () => {
    enforce(zipCode).isNotEmpty();
  });

  // TODO: implement internalization rules for postal codes
  // test('zipCode', i18n.nft_checkout.zip_code_length_of_5.toString(), () => {
  //   enforce(zipCode).lengthEquals(5);
  // });

  test('zipCode', i18n.nft_checkout.zip_code_alphanumeric_only.toString(), () => {
    enforce(zipCode).matches(/^[0-9a-zA-Z]+$/);
  });

  test('fullLegalName', i18n.nft_checkout.full_legal_name_required.toString(), () => {
    enforce(fullLegalName).isNotEmpty();
  });

  test('fullLegalName', i18n.nft_checkout.full_legal_name_invalid_entry.toString(), () => {
    enforce(fullLegalName).matches(/^[0-9a-zA-Z ]+$/);
  });
});

const Resolved = () => {
  const { mode } = useThemeMode();
  const { navigateTo } = useControllerContext();

  const { updateNFTPaypalCheckoutState } = useNFTPaypalCheckoutState();
  const { setErrorType } = useNFTError();

  const hostedFields = usePayPalHostedFields();
  const [validity, setValidity] = useState({
    number: { isValid: false, errorMessage: '' },
    expirationDate: { isValid: false, errorMessage: '' },
    cvv: { isValid: false, errorMessage: '' },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid, errors, isSubmitting },
  } = useForm<FormData>({
    mode: 'onChange',
    resolver: vestResolver(validationSuite),
  });

  const cardType = watch('cardType');

  const isFormValid = useMemo(() => {
    return isValid && Object.values(validity).every(item => item.isValid);
  }, [validity, isValid]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    if (!hostedFields.cardFields) {
      getLogger().warn('Warning with onSubmit via Resolved component: Hosted fields not ready');
      return;
    }

    try {
      // hostedFields.cardFields.setAttribute;
      const data = await hostedFields.cardFields.submit({
        fullLegalName: formData.fullLegalName,
        zipCode: formData.zipCode,
      });

      if (data.authenticationStatus !== 'APPROVED') {
        throw new Error('Error approving the payment');
      }

      updateNFTPaypalCheckoutState({
        orderId: data.orderId,
        lastDigits: data.card.last_digits,
        cardType: formData.cardType,
      });

      navigateTo('nft-checkout-paypal');
    } catch (e) {
      getLogger().error('Error with hostedFields.cardFields.submit', buildMessageContext(e));

      setErrorType(e instanceof Error ? e.message : NFT_ERROR_TYPES.SOMETHING_WENT_WRONG);
      navigateTo('nft-checkout-error');
    }
  });

  useEffect(() => {
    if (!hostedFields.cardFields) {
      return;
    }

    hostedFields.cardFields?.on('cardTypeChange', e => {
      if (e.cards.length === 1) {
        const card = e.cards[0];
        if (includes(Object.values(CARD_TYPES), card.type)) {
          setValue('cardType', card.type);
          return;
        }
      }

      setValue('cardType', CARD_TYPES.UNKNOWN);
    });

    hostedFields.cardFields?.on('validityChange', e => {
      const { number, expirationDate, cvv } = e.fields;

      setValidity({
        number: {
          isValid: number.isValid,
          errorMessage: number.isEmpty || number.isValid ? '' : i18n.nft_checkout.card_number_invalid.toString(),
        },
        expirationDate: {
          isValid: expirationDate.isValid,
          errorMessage:
            expirationDate.isEmpty || expirationDate.isValid
              ? ''
              : i18n.nft_checkout.expiration_date_invalid.toString(),
        },
        cvv: {
          isValid: cvv.isValid,
          errorMessage: cvv.isEmpty || cvv.isValid ? '' : i18n.nft_checkout.cvv_invalid.toString(),
        },
      });
    });
  }, [hostedFields]);

  return (
    <Flex.Column alignItems="flex-start">
      <Spacer size={40} orientation="vertical" />

      <form
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}
        onSubmit={onSubmit}
      >
        <Typography.H4 weight="700" color={mode('var(--ink100)', 'var(--white')}>
          {i18n.nft_checkout.payment_details.toString()}
        </Typography.H4>
        <Spacer size={24} orientation="vertical" />
        <TextField
          label={i18n.nft_checkout.full_legal_name.toString()}
          errorMessage={errors.fullLegalName?.message}
          placeholder="Arthur Clarke"
          type="text"
          {...register('fullLegalName')}
        />

        <Spacer size={20} orientation="vertical" />

        <CustomPaypalHostedField
          id="card-number"
          label={i18n.nft_checkout.card_number.toString()}
          errorMessage={validity.number.errorMessage}
          rightIcon={<CardIconSelector type={cardType} />}
          className="card-field"
          hostedFieldType="number"
          options={{
            selector: '#card-number',
            placeholder: '4111 1111 1111 1111',
          }}
        />

        <Spacer size={20} orientation="vertical" />

        <Flex style={{ gap: '16px' }}>
          <CustomPaypalHostedField
            id="expiration-date-1"
            label="Expiration"
            errorMessage={validity.expirationDate.errorMessage}
            className="card-field"
            hostedFieldType="expirationDate"
            options={{
              selector: '#expiration-date-1',
              placeholder: 'MM / YY',
            }}
          />
          <CustomPaypalHostedField
            id="cvv"
            label={i18n.nft_checkout.cvc.toString()}
            errorMessage={validity.cvv.errorMessage}
            className="card-field"
            hostedFieldType="cvv"
            options={{
              selector: '#cvv',
              placeholder: '123',
              maskInput: true,
            }}
          />
        </Flex>

        <Spacer size={20} orientation="vertical" />

        <Flex style={{ gap: '16px' }}>
          <TextField
            id="zip-code"
            label={i18n.nft_checkout.zip_code.toString()}
            errorMessage={errors.zipCode?.message}
            placeholder="00000"
            type="text"
            {...register('zipCode')}
          />
        </Flex>

        <Spacer size={32} orientation="vertical" />

        <Button type="submit" disabled={!isFormValid || isSubmitting} loading={isSubmitting} variant="black">
          <Typography.BodyMedium weight="600">{i18n.nft_checkout.review_purchase.toString()}</Typography.BodyMedium>
        </Button>
      </form>
    </Flex.Column>
  );
};

export const NFTCheckoutCardFormPage = () => {
  const { navigateBackToPrevPage } = useControllerContext();
  const { mode } = useThemeMode();
  const { nftCheckoutState } = useNFTCheckoutState();
  const { setNFTCheckoutType } = useNFTCheckoutType();

  const handleCreateOrder = useCallback(async () => {
    const { error, data: order } = await NFTService.createPaypalOrder({
      contractId: nftCheckoutState.contractId,
      toAddress: nftCheckoutState.walletAddress,
      tokenId: nftCheckoutState.tokenId,
      quantity: nftCheckoutState.quantity.toString(),
    });

    if (error || !order) {
      throw new Error(error ?? 'Error creating order');
    }

    return order.paymentProviderOrderId;
  }, [nftCheckoutState]);

  const hostedFieldsStyles = useMemo(() => {
    return {
      input: {
        'font-size': '16px',
        'font-weight': '300',
        'font-family':
          'Inter, ProximaNova, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif',
        color: mode('black', 'white'),
      },
    };
  }, []);

  useEffect(() => {
    setNFTCheckoutType(NFT_CHECKOUT_TYPES.CREDIT_OR_DEBIT);
  }, []);

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={navigateBackToPrevPage} />}
        rightAction={<CancelActionButton />}
        title="Checkout"
        header={
          <Flex direction="column" alignItems="center">
            <Typography.BodySmall weight="400" color="var(--ink70)">
              Checkout
            </Typography.BodySmall>
          </Flex>
        }
      />
      <PayPalHostedFieldsProvider styles={hostedFieldsStyles} createOrder={handleCreateOrder}>
        <Resolved />
      </PayPalHostedFieldsProvider>
    </>
  );
};
