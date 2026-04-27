import { NLP_PRODUCT_ID, ProductEngineType } from '@nadohq/client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { ROUTES } from 'client/modules/app/consts/routes';
import { mapValues } from 'lodash';
import { useMemo } from 'react';

/** This hook is used to map productId's to canonical page for the product.
 *  For perp markets, it links to the appropriate market on perp trading page
 *  For spot markets, it links to the appropriate market on spot trading page
 *  For special products, it may link to a product-specific page  (eg. NLP -> vault page)
 */
export function useProductIdLinks() {
  const { data: staticMarketData } = useAllMarketsStaticData();

  return useMemo(() => {
    if (!staticMarketData) {
      return undefined;
    }

    return {
      [NLP_PRODUCT_ID]: ROUTES.vault,
      ...mapValues(
        staticMarketData.allMarkets,
        ({ type: productType, metadata }) => {
          const marketName = metadata.marketName;

          const baseRoute =
            productType === ProductEngineType.SPOT
              ? ROUTES.spotTrading
              : ROUTES.perpTrading;

          return `${baseRoute}?market=${marketName}`;
        },
      ),
    };
  }, [staticMarketData]);
}
