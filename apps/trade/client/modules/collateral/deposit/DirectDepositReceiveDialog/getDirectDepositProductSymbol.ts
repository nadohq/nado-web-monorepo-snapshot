import { KNOWN_PRODUCT_IDS } from '@nadohq/react-client';
import { DepositProductSelectValue } from 'client/modules/collateral/deposit/types';
import type { TFunction } from 'i18next';

export function getDirectDepositProductSymbol(
  t: TFunction,
  product: DepositProductSelectValue,
) {
  if (product.productId === KNOWN_PRODUCT_IDS.weth) {
    return t(($) => $.symbolOrEth, { symbol: product.symbol });
  }
  if (product.isXStocksProduct) {
    // A bit of a hack here - `symbol` already includes the `w` prefix, so we strip it here
    return t(($) => $.symbolOrWrappedSymbol, {
      symbol: product.symbol.slice(1),
      wrappedSymbol: product.symbol,
    });
  }
  return product.symbol;
}
