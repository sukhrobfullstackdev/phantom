import BN from 'bn.js';
import { ethers } from 'ethers';
import { createBridge } from '~/app/libs/ledger';
import { getNetworkName, getWalletType, isETHWalletType, isMainnet } from '~/app/libs/network';
import { Web3Service } from '~/app/services/web3';
import {
  fromWeiToEth,
  getFiatValue,
  isGreaterThan,
  isGreaterThanOrEqualTo,
  subtract,
} from '~/features/connect-with-ui/utils/bn-math';
import { calculateTransactionAmounts } from '~/features/connect-with-ui/utils/calculate-transaction-amounts';
import { ethDecimalsToUnit } from '~/features/connect-with-ui/utils/transaction-type-utils';
import { toChecksumAddress } from './web3-utils';

export interface MultiChainTransactionAmountsInterface {
  transactionValue: string;
  transactionValueInFiat: number;
  networkFee: string;
  networkFeeInFiat: number;
  total: string;
  totalInFiat: number;
}

export default class LedgerBalance {
  private walletType: string;
  private network: string;
  private isETHWalletType: boolean;
  private LedgerBalanceFunctions: {
    ETH: {
      calculateRate: (balance: string, rate: string) => number;
      calculateTransactionAmounts: (
        value,
        ethPrice,
        payload,
        isConstructTxFlow,
      ) => Promise<{
        totalInFiat: number;
        transactionValueInFiat: number;
        total: string;
        networkFee: string;
        networkFeeInFiat: number;
        transactionValue: string;
      }>;
      isGreaterThan: (numOne: string, numTwo: string) => boolean;
      maxSendInFiat: (balance: string, price: string, networkFee: string) => number;
      fiatNeededToCoverTransaction: (total: string, balance: string, price: string) => number;
      balanceNeededToCoverTransaction: (total: string, balance: string) => number;
      verifyAddress: (address: string) => void;
      displayAmount: (amount: string) => number;
      getBalance: (address?: string) => Promise<any>;
      getUsdcBalance: (address?: string) => Promise<any>;
      isGreaterThanOrEqualTo: (numOne: string, numTwo: string) => boolean;
      getSendFundsPayload: () => void;
      getSendAmount: (amount: string) => string;
      getExplorerTransactionUrl: (url: string | undefined, hash: string | undefined) => string;
    };
    FLOW: {
      calculateRate: (balance: string, rate: string) => number;
      calculateTransactionAmounts: (
        value,
        price,
        payload,
      ) => {
        totalInFiat: number;
        transactionValueInFiat: number;
        total: any;
        networkFee: string;
        networkFeeInFiat: string;
        transactionValue: any;
      };
      isGreaterThan: (numOne: string, numTwo: string) => boolean;
      maxSendInFiat: (balance: string, price: string, networkFee?: string) => number;
      fiatNeededToCoverTransaction: (total: string, balance: string, price: string) => number;
      balanceNeededToCoverTransaction: (total: string, balance: string) => number;
      verifyAddress: (address: string) => void;
      displayAmount: (amount: string) => number;
      getBalance: (address: string) => Promise<any>;
      getUsdcBalance: (address: string) => Promise<any>;
      isGreaterThanOrEqualTo: (numOne: string, numTwo: string) => boolean;
      getSendFundsPayload: (
        method,
        recipient,
        amount,
        address,
      ) => {
        method: string;
        id: number;
        jsonrpc: string;
        params: { amount: any; address: any; recipient: any; network: string };
      };
      getSendAmount: (amount: string) => string;
      getExplorerTransactionUrl: (url: string | undefined, hash: string | undefined) => string;
    };
  };

  constructor() {
    this.walletType = getWalletType();
    this.network = getNetworkName();
    this.isETHWalletType = isETHWalletType();
    this.LedgerBalanceFunctions = {
      FLOW: {
        getBalance: this.flowGetBalance,
        getUsdcBalance: this.flowGetUsdcBalance,
        calculateRate: this.calculateFlowRate,
        isGreaterThanOrEqualTo: this.isGreaterThanOrEqualToMultiChain,
        maxSendInFiat: this.flowSendMaxFiat,
        verifyAddress: this.verifyFlowAddress,
        isGreaterThan: this.isGreaterThanMultiChain,
        calculateTransactionAmounts: this.calculateTransactionAmountsMultichain,
        displayAmount: this.displayAmountMultiChain,
        getSendFundsPayload: this.getFlowSendFundsPayload,
        getSendAmount: this.getSendAmountFlow,
        getExplorerTransactionUrl: this.getExplorerTransactionUrlFlow,
        balanceNeededToCoverTransaction: this.balanceNeededToCoverTransactionFlow,
        fiatNeededToCoverTransaction: this.fiatNeededToCoverTransactionFLOW,
      },
      ETH: {
        getBalance: Web3Service.getBalance,
        getUsdcBalance: () => Promise.resolve('0'), // only care about this method for Flow
        calculateRate: this.calculateEVMRate,
        isGreaterThanOrEqualTo: this.isGreaterThanOrEqualToEvm,
        maxSendInFiat: this.EVMSendMaxFiat,
        verifyAddress: this.verifyETHAddress,
        isGreaterThan: this.isGreaterThanEVM,
        calculateTransactionAmounts: this.calculateTransactionAmountsEVM,
        displayAmount: this.displayAmountEVM,
        getSendFundsPayload: () => {},
        getSendAmount: this.getSendAmountEVM,
        getExplorerTransactionUrl: this.getExplorerTransactionUrlEVM,
        balanceNeededToCoverTransaction: this.balanceNeededToCoverTransactionETH,
        fiatNeededToCoverTransaction: this.fiatNeededToCoverTransactionEVM,
      },
    };
  }

  public balanceNeededToCoverTransaction(total: string, balance: string) {
    return this.LedgerBalanceFunctions[this.walletType].balanceNeededToCoverTransaction(total, balance);
  }

  public fiatNeededToCoverTransaction(total: string, balance: string, price: string) {
    return this.LedgerBalanceFunctions[this.walletType].fiatNeededToCoverTransaction(total, balance, price);
  }

  public getBalance() {
    return this.LedgerBalanceFunctions[this.walletType].getBalance;
  }

  public getUsdcBalance() {
    return this.LedgerBalanceFunctions[this.walletType].getUsdcBalance;
  }

  public calculateRate() {
    return this.LedgerBalanceFunctions[this.walletType].calculateRate;
  }

  public isGreaterThanOrEqualTo() {
    return this.LedgerBalanceFunctions[this.walletType].isGreaterThanOrEqualTo;
  }

  public maxSendInFiat() {
    return this.LedgerBalanceFunctions[this.walletType].maxSendInFiat;
  }

  public verifyAddress() {
    return this.LedgerBalanceFunctions[this.walletType].verifyAddress;
  }

  public isGreaterThan(numOne: string, numTwo: string) {
    return this.LedgerBalanceFunctions[this.walletType].isGreaterThan(numOne, numTwo);
  }

  public calculateTransactionAmounts(value, price, payload, isConstructTxFlow = false) {
    return this.LedgerBalanceFunctions[this.walletType].calculateTransactionAmounts(
      value,
      price,
      payload,
      isConstructTxFlow,
    );
  }

  public getSendFundsPayload() {
    return this.LedgerBalanceFunctions[this.walletType].getSendFundsPayload;
  }

  public displayAmount(amount: string) {
    return this.LedgerBalanceFunctions[this.walletType].displayAmount(amount);
  }

  public formatSendAmount(amount: string, decimals?: number) {
    return isETHWalletType() ? ethers.utils.parseUnits(amount || '0', ethDecimalsToUnit[decimals || 18]) : amount;
  }

  public getSendAmount(amount: string) {
    return this.LedgerBalanceFunctions[this.walletType].getSendAmount(amount);
  }

  public getExplorerTransactionUrl(url: string | undefined, hash: string | undefined) {
    return this.LedgerBalanceFunctions[this.walletType].getExplorerTransactionUrl(url, hash);
  }

  async flowGetBalance(address: string) {
    const { ledgerBridge } = await createBridge();
    const network = getNetworkName();
    const balancePayload = {
      params: {
        address,
        network: network.toLocaleLowerCase() === 'mainnet' ? 'mainnet' : 'testnet',
      },
    };
    const balances: {
      minimumStorageReservation: string;
      storageCapacity: string;
      storageUsed: string;
      useableAccountBalance: string;
      storageMegaBytesPerReservedFLOW: string;
    } = await ledgerBridge.getBalance(balancePayload);
    return balances.useableAccountBalance;
  }

  async flowGetUsdcBalance(address: string) {
    const { ledgerBridge } = await createBridge();
    const network = getNetworkName();
    const balancePayload = {
      params: {
        address,
        network: network.toLocaleLowerCase() === 'mainnet' ? 'mainnet' : 'testnet',
      },
    };
    return ledgerBridge.getUsdcBalance(balancePayload) as Promise<string>;
  }

  calculateEVMRate(balance: string, rate: string) {
    if (!balance || !rate) return 0;
    const balanceBigNumber = ethers.BigNumber.from(balance || '0').toString();
    return getFiatValue(balanceBigNumber, rate);
  }

  calculateFlowRate(balance: string, rate: string) {
    return Number(balance) * Number(rate);
  }

  isGreaterThanOrEqualToMultiChain(numOne: string, numTwo: string) {
    return Number(numOne) >= Number(numTwo);
  }

  isGreaterThanOrEqualToEvm(numOne: string, numTwo: string) {
    const bigNumberOne = ethers.BigNumber.from(numOne || '0').toString();
    const bigNumberTwo = ethers.BigNumber.from(numTwo || '0').toString();
    return isGreaterThanOrEqualTo(bigNumberOne, bigNumberTwo);
  }

  isGreaterThanEVM(numOne: string, numTwo: string) {
    const bigNumberOne = ethers.BigNumber.from(numOne || '0').toString();
    const bigNumberTwo = ethers.BigNumber.from(numTwo || '0').toString();
    return isGreaterThan(bigNumberOne, bigNumberTwo);
  }

  isGreaterThanMultiChain(numOne: string, numTwo: string) {
    return Number(numOne) > Number(numTwo);
  }

  EVMSendMaxFiat(balance: string, price: string, networkFee: string) {
    const balanceBigNumber = ethers.BigNumber.from(balance || '0').toString();
    if (networkFee === '0' || new BN(networkFee).gt(new BN(balanceBigNumber))) return 0;
    return getFiatValue(subtract(balanceBigNumber, networkFee).toString(), price);
  }

  flowSendMaxFiat(balance: string, price: string, networkFee?: string) {
    return Number(balance) * Number(price);
  }

  balanceToShow(balance: string) {
    return this.isETHWalletType ? Number(fromWeiToEth(balance)) || 0 : Number(balance);
  }

  verifyETHAddress(address: string) {
    return ethers.utils.isAddress(toChecksumAddress(address) as string);
  }

  verifyFlowAddress(address: string) {
    if (address.length === 18) return true;
    // eslint-disable-next-line no-throw-literal
    throw { error: 'invalid address', message: 'invalid address' };
  }

  async calculateTransactionAmountsEVM(value, ethPrice, payload, isConstructTxFlow = false) {
    const transactionValue = await calculateTransactionAmounts(value, ethPrice, payload, isConstructTxFlow);

    return {
      transactionValue: transactionValue.transactionValueInWei,
      transactionValueInFiat: transactionValue.transactionValueInFiat,
      networkFee: transactionValue.networkFeeInWei,
      networkFeeInFiat: transactionValue.networkFeeInFiat,
      total: transactionValue.totalInWei,
      totalInFiat: transactionValue.totalInFiat,
    };
  }

  calculateTransactionAmountsMultichain(value, price, payload) {
    return {
      transactionValue: value,
      transactionValueInFiat: Number(value) * Number(price),
      networkFee: '0',
      networkFeeInFiat: '0',
      total: value,
      totalInFiat: Number(value) * Number(price),
    };
  }

  displayAmountEVM(amount: string) {
    return Number(fromWeiToEth(amount || '0'));
  }

  displayAmountMultiChain(amount: string) {
    return Number(amount);
  }

  getFlowSendFundsPayload(method, recipient, amount, address) {
    return {
      id: 42,
      jsonrpc: '2.0',
      method,
      params: {
        recipient,
        amount,
        address,
        network: isMainnet() ? 'mainnet' : 'testnet',
      },
    };
  }

  getSendAmountEVM(amount: string) {
    return `0x${new BN(ethers.utils.parseUnits(amount.replaceAll(',', ''), 'ether').toString()).toString(16)}`;
  }

  getSendAmountFlow(amount: string) {
    const num = Number(amount);
    if (Number.isInteger(num)) {
      return num.toFixed(1);
    }
    return amount;
  }

  getExplorerTransactionUrlEVM(url: string | undefined, hash: string | undefined) {
    return `${url}/tx/${hash}`;
  }

  getExplorerTransactionUrlFlow(url: string | undefined, hash: string | undefined) {
    return `${url}/transaction/${hash}`;
  }

  balanceNeededToCoverTransactionETH(total: string, balance: string) {
    return Number(ethers.utils.formatUnits(subtract(total, balance))) || 0;
  }

  balanceNeededToCoverTransactionFlow(total: string, balance: string) {
    return Number(total) - Number(balance);
  }

  fiatNeededToCoverTransactionEVM(total: string, balance: string, price: string) {
    return Number(getFiatValue(subtract(total, balance), price)) || 0;
  }

  fiatNeededToCoverTransactionFLOW(total: string, balance: string, price: string) {
    const totalNum = Number(total);
    const balanceNum = Number(balance);
    const priceNum = Number(price);
    return (totalNum - balanceNum) * priceNum;
  }
}
