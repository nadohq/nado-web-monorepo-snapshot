import { BigNumber } from 'bignumber.js';
import {
  useDepositForm,
  UseDepositForm,
} from 'client/modules/collateral/deposit/hooks/useDepositForm';
import { roundToString } from 'client/utils/rounding';
import { useCallback, useMemo } from 'react';

interface BalanceState {
  borrowed: BigNumber;
  wallet: BigNumber | undefined;
}

export interface UseRepayDepositForm extends UseDepositForm {
  balances: {
    current: BalanceState | undefined;
    estimated: BalanceState | undefined;
  };

  onMaxRepayClicked(): void;

  onAmountBorrowingClicked(): void;

  onMaxDepositClicked(): void;
}

export function useRepayDepositForm({
  initialProductId,
}: {
  initialProductId: number | undefined;
}): UseRepayDepositForm {
  const {
    selectedProduct: depositSelectedProduct,
    availableProducts: depositAvailableProducts,
    validAmount,
    form,
    ...rest
  } = useDepositForm({ initialProductId });
  const { setValue } = form;

  // Remap products to reflect amount borrowed, and filter out non-borrows
  const availableProducts = useMemo(() => {
    return depositAvailableProducts
      .filter((product) => product.decimalAdjustedNadoBalance.isNegative())
      .map((product) => {
        return {
          ...product,
          displayedAssetAmount: product.decimalAdjustedNadoBalance.abs(),
          displayedAssetValueUsd: product.decimalAdjustedNadoBalance
            .abs()
            .multipliedBy(product.oraclePrice),
        };
      });
  }, [depositAvailableProducts]);
  const selectedProduct = useMemo(() => {
    return availableProducts.find(
      (product) => product.productId === depositSelectedProduct?.productId,
    );
  }, [availableProducts, depositSelectedProduct?.productId]);

  const selectedProductCurrentBorrows = useMemo(() => {
    return selectedProduct?.decimalAdjustedNadoBalance.abs();
  }, [selectedProduct?.decimalAdjustedNadoBalance]);

  // Estimate balances
  const balances = useMemo((): UseRepayDepositForm['balances'] => {
    if (!selectedProduct || !selectedProductCurrentBorrows) {
      return {
        current: undefined,
        estimated: undefined,
      };
    }

    return {
      current: {
        borrowed: selectedProductCurrentBorrows,
        wallet: selectedProduct.decimalAdjustedWalletBalance,
      },
      estimated: validAmount
        ? {
            borrowed: selectedProductCurrentBorrows.minus(validAmount),
            wallet:
              selectedProduct.decimalAdjustedWalletBalance?.minus(validAmount),
          }
        : undefined,
    };
  }, [selectedProduct, selectedProductCurrentBorrows, validAmount]);

  const onMaxRepayClicked = useCallback(() => {
    if (
      !selectedProduct ||
      !selectedProductCurrentBorrows ||
      !selectedProduct.decimalAdjustedWalletBalance
    ) {
      return;
    }
    setValue(
      'amount',
      // Ensure we don't try to repay more than we have, but round the number up to ensure all borrows are paid off
      BigNumber.min(
        selectedProductCurrentBorrows.precision(8, BigNumber.ROUND_UP),
        selectedProduct.decimalAdjustedWalletBalance.precision(
          8,
          BigNumber.ROUND_DOWN,
        ),
      ).toString(),
      {
        shouldValidate: true,
        shouldTouch: true,
      },
    );
  }, [selectedProduct, selectedProductCurrentBorrows, setValue]);

  const onAmountBorrowingClicked = useCallback(() => {
    if (!selectedProductCurrentBorrows) {
      return;
    }
    setValue(
      'amount',
      roundToString(selectedProductCurrentBorrows, 8, BigNumber.ROUND_UP),
      {
        shouldValidate: true,
        shouldTouch: true,
      },
    );
  }, [selectedProductCurrentBorrows, setValue]);

  const onMaxDepositClicked = useCallback(() => {
    if (!selectedProduct || !selectedProduct.decimalAdjustedWalletBalance) {
      return;
    }
    setValue(
      'amount',
      roundToString(
        selectedProduct.decimalAdjustedWalletBalance,
        8,
        BigNumber.ROUND_DOWN,
      ),
      {
        shouldValidate: true,
        shouldTouch: true,
      },
    );
  }, [selectedProduct, setValue]);

  return {
    selectedProduct,
    availableProducts,
    onMaxRepayClicked,
    onAmountBorrowingClicked,
    onMaxDepositClicked,
    balances,
    validAmount,
    form,
    ...rest,
  };
}
