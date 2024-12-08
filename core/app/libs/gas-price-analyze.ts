import BN from 'bn.js';
import { cloneDeep, isEmpty } from '~/app/libs/lodash-utils';

import { Web3Service } from '~/app/services/web3';

const SIMPLE_GAS_COST = '0x5208'; // Hex for 21000, cost of a simple send.

/**
 * Prefixes a hex string with '0x' or '-0x' and returns it. Idempotent.
 *
 * @param {string} str - The string to prefix.
 * @returns {string} The prefixed string.
 */
const addHexPrefix = str => {
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  if (typeof str !== 'string' || str.match(/^-?0x/u)) {
    return str;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  if (str.match(/^-?0X/u)) {
    return str.replace('0X', '0x');
  }

  if (str.startsWith('-')) {
    return str.replace('-', '-0x');
  }

  return `0x${str}`;
};

/**
 * Used to multiply a BN by a fraction
 *
 * @param {BN} targetBN - The number to multiply by a fraction
 * @param {number|string} numerator - The numerator of the fraction multiplier
 * @param {number|string} denominator - The denominator of the fraction multiplier
 * @returns {BN} The product of the multiplication
 *
 */
const BnMultiplyByFraction = (targetBN, numerator, denominator) => {
  const numBN = new BN(numerator);
  const denomBN = new BN(denominator);
  return targetBN.mul(numBN).div(denomBN);
};

/**
 * Converts a BN object to a hex string with a '0x' prefix
 *
 * @param {BN} inputBn - The BN to convert to a hex string
 * @returns {string} - A '0x' prefixed hex string
 *
 */
const bnToHex = inputBn => {
  return addHexPrefix(inputBn.toString(16));
};

/**
 * Result of gas analysis, including either a gas estimate for a successful analysis, or
 * debug information for a failed analysis.
 * @typedef {Object} GasAnalysisResult
 * @property {string} blockGasLimit - The gas limit of the block used for the analysis
 * @property {string} estimatedGasHex - The estimated gas, in hexadecimal
 * @property {Object} simulationFails - Debug information about why an analysis failed
 */

/**
 tx-gas-utils are gas utility methods for Transaction manager
 its passed ethquery
 and used to do things like calculate gas of a tx.
 @param {Object} provider - A network provider.
 */

class TxGasUtil {
  /**
     @param {Object} txMeta - the txMeta object
     @returns {GasAnalysisResult} The result of the gas analysis
     */
  async analyzeGasUsage(txMeta) {
    const block = (await Web3Service.getBlock('latest')) as any;

    // fallback to block gasLimit
    const blockGasLimitBN = new BN(Number(block.gasLimit));
    const saferGasLimitBN = BnMultiplyByFraction(blockGasLimitBN, 19, 20);
    let estimatedGasHex = bnToHex(saferGasLimitBN);

    let simulationFails;
    try {
      estimatedGasHex = await this.estimateTxGas(txMeta);
    } catch (e) {
      simulationFails = {
        reason: e.message,
        errorKey: e.errorKey,
        debug: { blockNumber: block.number, blockGasLimit: block.gasLimit },
      };
    }

    return { blockGasLimit: block.gasLimit, estimatedGasHex, simulationFails };
  }

  /**
     Estimates the tx's gas usage
     @param {Object} txMeta - the txMeta object
     @returns {string} the estimated gas limit as a hex string
     */
  async estimateTxGas(txMeta) {
    const txParams = cloneDeep(txMeta.params[0]);

    // `eth_estimateGas` can fail if the user has insufficient balance for the
    // value being sent, or for the gas cost. We don't want to check their
    // balance here, we just want the gas estimate. The gas price is removed
    // to skip those balance checks. We check balance elsewhere.
    delete txParams.gasPrice;

    // estimate tx gas requirements
    return Web3Service.estimateGas(txParams);
  }

  /**
     Adds a gas buffer with out exceeding the block gas limit
     @param {string} initialGasLimit - the initial gas limit to add the buffer too
     @param {string} blockGasLimit - the block gas limit
     @returns {string} the buffered gas limit as a hex string
     */
  addGasBuffer(initialGasLimit, blockGasLimit, multiplier = 1.5) {
    const initialGasLimitBn = new BN(Number(initialGasLimit));
    const blockGasLimitBn = new BN(Number(blockGasLimit));
    const upperGasLimitBn = blockGasLimitBn.muln(0.9);
    const bufferedGasLimitBn = initialGasLimitBn.muln(multiplier);

    // if initialGasLimit is above blockGasLimit, dont modify it
    if (initialGasLimitBn.gt(upperGasLimitBn)) {
      return bnToHex(initialGasLimitBn);
    }

    // if bufferedGasLimit is below blockGasLimit, use bufferedGasLimit
    if (bufferedGasLimitBn.lt(upperGasLimitBn)) {
      return bnToHex(bufferedGasLimitBn);
    }

    // otherwise use blockGasLimit
    return bnToHex(upperGasLimitBn);
  }

  async getBufferedGasLimit(txMeta, multiplier) {
    const { blockGasLimit, estimatedGasHex, simulationFails } = await this.analyzeGasUsage(txMeta);

    // add additional gas buffer to our estimation for safety
    const gasLimit = this.addGasBuffer(addHexPrefix(estimatedGasHex), blockGasLimit, multiplier);
    return { gasLimit, simulationFails };
  }
}

export const getDefaultGasLimit = async txMeta => {
  if (isEmpty(txMeta.params[0].data) || txMeta.params[0].data === '0x' || txMeta.params[0].data === '0x0') {
    return { gasLimit: SIMPLE_GAS_COST };
  }
  if (txMeta.params[0].gas) {
    return { gasLimit: txMeta.params[0].gas };
  }

  const txGasUtil = new TxGasUtil();

  const { blockGasLimit, estimatedGasHex, simulationFails } = await txGasUtil.analyzeGasUsage(txMeta);

  if (!isEmpty(simulationFails)) throw simulationFails;

  // add additional gas buffer to our estimation for safety
  const gasLimit = txGasUtil.addGasBuffer(addHexPrefix(estimatedGasHex), blockGasLimit);
  return { gasLimit };
};
