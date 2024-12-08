/*
  eslint-disable

  no-multi-assign,
  no-unused-expressions,
  prefer-rest-params,
 */

import { merge } from '~/app/libs/lodash-utils';
import { getBaseProperties } from './analytics-datadog-helpers';
import { htevents } from './hightouch';

interface AnalyticsUserInfo {
  userID?: string;
}

export enum AnalyticsActionType {
  ConfirmPageShown = 'Confirm Page Shown',
  PendingModalUpdated = 'Pending Modal Updated',
  PendingModalFooterLinkClicked = 'Pending Modal Footer Link Clicked',
  ConfirmPageFooterLinkClicked = 'Confirm Page Footer Link Clicked',
  NFTTransferFooterLinkClicked = 'NFTTransfer Page Footer Link Clicked',
  TransactionSigned = 'Transaction Signed',
  RpcChannelStarted = 'RPC Channel Initialized',
  WalletUINotEnabled = 'Wallet UI not enabled for scoped app',
  HeadlessSendTransactionCalled = 'Headless Eth Send Transaction Called',
  HeadlessPersonalSignCalled = 'Headless Eth Personal Sign Called',
  HeadlessSignTypedDataV3Called = 'Headless SignTypedData_V3 Called',
  HeadlessSignTypedDataV4Called = 'Headless SignTypedData_V4 Called',
  HeadlessSendGaslessTransactionCalled = 'Headless Eth Send Gasless Transaction Called',
  RevealSecretPhraseClicked = 'Reveal secret phrase clicked',
  RevealSecretPhraseRedirectClicked = 'Reveal secret phrase redirect clicked',
  LoginStarted = 'Login Started',
  BuyCryptoClick = 'Buy Crypto Click',
  ComposeTransactionStart = 'Compose Transaction Start',
  ReceiveClick = 'Receive Click',
  ComposeTransactionFinish = 'Compose Transaction Finish',
  SeedPhraseCopied = 'Seed Phrase Copied',
  LogoutClick = 'Logout Click',
  TokenSelected = 'Token Selected',
  TransactionSent = 'Transaction Sent',
  SardineClick = 'Sardine Click',
  ApplePayClick = 'Apple Pay Click',
  GooglePayClick = 'Google Pay Click',
  CreditCardClick = 'Credit Card Click',
  StripeClick = 'Stripe Click',
  BankTransferClick = 'Bank Transfer Click',
  OnramperClick = 'Onramper Click',
  PayPalClick = 'PayPal Click',
  PayPalCompleted = 'PayPal Completed',
  PayPalAbandond = 'PayPal Abandoned',
  ActionOtpChallenge = 'Action Otp Challenge',
  IframeStyleChanged = 'Iframe Style Changed',
  IframeNotFound = 'Iframe Not Found',
  PrivateKeyCopied = 'Private Key Copied',
  SeedPhraseyCopied = 'Seed Phrase Copied',
  RevealPrivateKeyClicked = 'Reveal private key clicked',
  WidgetUiTrialModeBannerUpgradeButtonClicked = 'Widget UI Trial Mode Banner Upgrade Button Clicked',
  PreviewNFTTransferClicked = 'Preview NFT Transfer Clicked',
  NFTTransferFailed = 'NFT Transfer Failed',
  NFTTransferred = 'NFT Transferred',
  NFTSendClicked = 'NFT Send Clicked',
  NFTCheckoutFailed = 'NFT Checkout Failed',
  NFTCheckoutSuccess = 'NFT Checkout Success',
  RpcNFTTransferCalled = 'RPC NFT Transfer Called',

  NewWalletCreated = 'New Wallet Created',
  SeedPhraseRevealed = 'Seed Phrase Revealed',
}

/**
 * Emit a page event to Hightouch analytics, for use on page load
 * using same key from the baseProperties can replace the default base value
 *
 * Usage:
 * import { AnalyticsActionType, trackPage } from '~/app/libs/analytics';
 * trackPage(AnalyticsActionType.NewActionType, {additionalProp: 'abcdefg', ...})
 */
export function trackPage(pageName: string, extraProperties = {}) {
  if (!pageName) return;

  const properties = merge(getBaseProperties(), extraProperties);
  htevents.page(pageName, properties);
}

/**
 * Emit a track event to Hightouch analytics, for use on user action or server result
 * using same key from the baseProperties can replace the default base value
 *
 * Usage:
 * import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
 * trackAction(AnalyticsActionType.NewActionType, {additionalProp: 'abcdefg', ...})
 */
export function trackAction(actionName: AnalyticsActionType, extraProperties = {}) {
  if (!actionName) return;

  const properties = merge(getBaseProperties(), extraProperties);
  htevents.track(actionName, properties);
}

export const aliasIdentity = (userInfo: AnalyticsUserInfo = {}) => {
  htevents.alias(`auth-user:${userInfo.userID}`, `auth-user:${userInfo.userID}`);
  /* Need to identify again: https://segment.com/docs/destinations/amplitude/#alias */
  htevents.identify(`auth-user:${userInfo.userID}`, { user_type: 'magic-end-user' });
};
