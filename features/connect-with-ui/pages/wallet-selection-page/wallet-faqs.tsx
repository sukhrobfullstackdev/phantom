import { TextButton } from '@magiclabs/ui';
import React from 'react';
import styles from './wallet-selection-page.less';

export const walletFAQs = [
  {
    question: "What's a wallet?",
    answer:
      'Wallets are used to interact with blockchains. Each wallet has a unique address and can contain things like cryptocurrencies or digital collectibles (NFTs). One person can own multiple wallets. ',
  },
  {
    question: 'What are App Wallets?',
    answer:
      'App wallets are existing wallets you created for apps powered by Magic. Magic securely retrieves any eligible App Wallets that belong to your email address.',
  },
  {
    question: 'Supported App Wallets',
    answer:
      'Currently, Magic offers access to wallets from apps powered by Magic. Wallets must have been created using email or Google logins on either Ethereum, Polygon, or Optimism blockchains. Wallets with two-step verification enabled are not currently supported.',
  },
  {
    question: 'I don’t see my wallet',
    answer: [
      'If a wallet appears to be missing, it may be because: ',
      <ul className={styles.bulletList} key="list">
        <li>Wallet belongs to a different blockchain</li>
        <li>Wallet was created using a different login method</li>
        <li>Wallet belongs to a different email address</li>
        <li>App does not allow external wallet access</li>
        <li>Wallet has 2-step verification enabled</li>
      </ul>,
    ],
  },
  {
    question: 'Privacy protections',
    answer:
      'Your collection of wallets is private by default. Apps can only see the the wallet you choose to connect. Apps must request permission to access to your personal info (e.g. email address), so you are always in control.',
  },
  {
    question: 'Additional questions?',
    answer: [
      'If you have more questions about Magic Wallet, you can head to the ',
      <a
        href="https://magic.link/docs/home/faqs/wallet-end-users"
        rel="noreferrer"
        target="_blank"
        className={styles.link}
        key="help-desk"
      >
        <TextButton>Magic Help Desk</TextButton>
      </a>,
      '.',
    ],
  },
];
