import { safeDiv } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  OrderFormSizeDenom,
  RoundAmountFn,
} from 'client/modules/trading/types/orderFormTypes';

interface ConvertOrderSizeToAssetAmountParams {
  /**
   * The size to convert (can be undefined)
   */
  size: BigNumber | undefined;
  /**
   * Whether the size represents 'asset' or 'quote'
   */
  sizeDenom: OrderFormSizeDenom;
  /**
   * The conversion price from asset to quote
   */
  conversionPrice: BigNumber | undefined;
  /**
   * The function to round the asset amount
   */
  roundAssetAmount: RoundAmountFn;
}

/**
 * Converts an order size to an asset amount based on the size denom.
 * @returns Asset amount (unchanged if source is 'asset', converted if source is 'quote')
 */
export function convertOrderSizeToAssetAmount({
  size,
  sizeDenom,
  conversionPrice,
  roundAssetAmount,
}: ConvertOrderSizeToAssetAmountParams): BigNumber | undefined {
  if (!size) {
    return;
  }

  if (sizeDenom === 'asset') {
    return size;
  }

  if (!conversionPrice) {
    return;
  }

  return roundAssetAmount(safeDiv(size, conversionPrice));
}

interface ConvertAssetAmountToOrderSizeParams {
  assetAmount: BigNumber;
  /**
   * Whether the result should represent 'asset' or 'quote'
   */
  sizeDenom: OrderFormSizeDenom;
  /**
   * The conversion price from asset to quote
   */
  conversionPrice: BigNumber;
  /**
   * The function to round the amount
   */
  roundAssetAmount: RoundAmountFn;
}

/**
 * Converts an asset amount to an order size based on the size denom.
 * @returns Size (unchanged if source is 'asset', converted if source is 'quote')
 */
export function convertAssetAmountToOrderSize({
  assetAmount,
  sizeDenom,
  conversionPrice,
  roundAssetAmount,
}: ConvertAssetAmountToOrderSizeParams): BigNumber {
  return sizeDenom === 'asset'
    ? roundAssetAmount(assetAmount)
    : assetAmount.multipliedBy(conversionPrice);
}

interface ConvertOrderSizeToDenomParams {
  /** Order size in the current denomination. */
  size: BigNumber;
  /** Target denomination to convert to. */
  sizeDenom: OrderFormSizeDenom;
  /** Price used for conversion. */
  conversionPrice: BigNumber;
  /** The function to round the asset amount */
  roundAssetAmount: RoundAmountFn;
}

/**
 * Converts an order size from its current denomination to a new one.
 * @returns Size in the new denomination.
 */
export function toNewDenomOrderSize({
  size,
  sizeDenom,
  conversionPrice,
  roundAssetAmount,
}: ConvertOrderSizeToDenomParams) {
  return sizeDenom === 'quote'
    ? size.multipliedBy(conversionPrice)
    : roundAssetAmount(size.dividedBy(conversionPrice));
}
