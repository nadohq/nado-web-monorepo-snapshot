import { BigNumber } from 'bignumber.js';
import { UseQueryMaxOrderSizeParams } from 'client/hooks/query/subaccount/useQueryMaxOrderSize';
import { useMaxOrderSizeEstimation } from 'client/hooks/subaccount/useMaxOrderSizeEstimation';
import { RepayConvertProductSelectValue } from 'client/modules/collateral/repay/hooks/useRepayConvertForm/types';
import { useMemo } from 'react';

interface Params {
  executionConversionPrice: BigNumber | undefined;
  isSellOrder: boolean;
  marketProductId: number | undefined;
  selectedRepayProduct: RepayConvertProductSelectValue | undefined;
  roundAmount: (
    amount: BigNumber,
    roundingMode?: BigNumber.RoundingMode,
  ) => BigNumber;
}

export function useRepayConvertMaxRepaySizes({
  executionConversionPrice,
  isSellOrder,
  marketProductId,
  selectedRepayProduct,
  roundAmount,
}: Params) {
  const maxOrderSizeParams = useMemo(():
    | UseQueryMaxOrderSizeParams
    | undefined => {
    if (!executionConversionPrice || !marketProductId) {
      return;
    }

    return {
      price: executionConversionPrice,
      side: isSellOrder ? 'short' : 'long',
      productId: marketProductId,
      spotLeverage: false,
    };
  }, [executionConversionPrice, isSellOrder, marketProductId]);

  // The order size can apply to either the source or repay product, depending on the order type, but we're
  // interested in the max size of the repay product
  const { data: maxAssetOrderSize } =
    useMaxOrderSizeEstimation(maxOrderSizeParams);

  const maxRepaySizeIgnoringAmountBorrowed = useMemo(() => {
    if (!executionConversionPrice || !maxAssetOrderSize) {
      return;
    }

    if (isSellOrder) {
      // This means we're repaying quote, so we need to convert asset -> quote
      const convertedMaxAssetOrderSize = maxAssetOrderSize.multipliedBy(
        executionConversionPrice,
      );

      return roundAmount(convertedMaxAssetOrderSize);
    }

    return roundAmount(maxAssetOrderSize);
  }, [executionConversionPrice, isSellOrder, maxAssetOrderSize, roundAmount]);

  // The max repay size is the minimum of the amount borrowed & the max order size
  const maxRepaySize = useMemo(() => {
    if (!selectedRepayProduct) {
      return maxRepaySizeIgnoringAmountBorrowed;
    }

    if (!maxRepaySizeIgnoringAmountBorrowed) {
      return;
    }

    // Never exceed max order size.
    const roundedMaxRepaySizeIgnoringAmountBorrowed = roundAmount(
      maxRepaySizeIgnoringAmountBorrowed,
    );

    // Ensure fully repaying the amount borrowed.
    const roundedAmountBorrowed = roundAmount(
      selectedRepayProduct.amountBorrowed,
      BigNumber.ROUND_UP,
    );

    return BigNumber.min(
      roundedMaxRepaySizeIgnoringAmountBorrowed,
      roundedAmountBorrowed,
    );
  }, [maxRepaySizeIgnoringAmountBorrowed, roundAmount, selectedRepayProduct]);

  return {
    maxRepaySizeIgnoringAmountBorrowed,
    maxRepaySize,
  };
}
