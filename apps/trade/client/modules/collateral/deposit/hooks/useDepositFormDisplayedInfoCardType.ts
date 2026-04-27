import { KNOWN_PRODUCT_IDS } from '@nadohq/react-client';
import {
  DepositInfoCardType,
  DepositProductSelectValue,
} from 'client/modules/collateral/deposit/types';
import { useMemo } from 'react';

interface Params {
  selectedProduct: DepositProductSelectValue | undefined;
  hasLoadedDepositableBalances: boolean;
}

export function useDepositFormDisplayedInfoCardType({
  selectedProduct,
  hasLoadedDepositableBalances,
}: Params) {
  return useMemo((): DepositInfoCardType | undefined => {
    if (!selectedProduct) {
      return;
    }

    if (
      selectedProduct.productId === KNOWN_PRODUCT_IDS.weth &&
      hasLoadedDepositableBalances
    ) {
      return 'wrap_weth';
    }
  }, [selectedProduct, hasLoadedDepositableBalances]);
}
