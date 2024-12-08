export const detectCreditCardCompany = (cardNumber: string) => {
  const firstDigits = parseInt(cardNumber.substring(0, 6), 10);

  if (firstDigits >= 400000 && firstDigits <= 499999) {
    return 'Visa';
  }

  if ((firstDigits >= 510000 && firstDigits <= 559999) || (firstDigits >= 222100 && firstDigits <= 272099)) {
    return 'Mastercard';
  }

  if ((firstDigits >= 340000 && firstDigits <= 349999) || (firstDigits >= 370000 && firstDigits <= 379999)) {
    return 'American Express';
  }

  if (firstDigits >= 601100 && firstDigits <= 601199) {
    return 'Discover';
  }

  return 'Unknown';
};

export const formatPrice = (value: number) => {
  const [integerPart, decimalPart] = value.toFixed(2).split('.');
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimalPart ? `.${decimalPart}` : '');
};

export const shortenCardNumber = (walletAddress: string) => {
  return walletAddress.slice(-4);
};
