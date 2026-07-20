import {
  DepositInfoCardType,
  DepositProductSelectValue,
} from 'client/modules/collateral/deposit/types';
import { useMemo } from 'react';

interface Params {
  selectedProduct: DepositProductSelectValue | undefined;
}

export function useDepositFormDisplayedInfoCardType({
  selectedProduct,
}: Params) {
  return useMemo((): DepositInfoCardType | undefined => {
    if (!selectedProduct) {
      return;
    }

    if (selectedProduct.isXStocksProduct) {
      return 'xstocks';
    }
  }, [selectedProduct]);
}
