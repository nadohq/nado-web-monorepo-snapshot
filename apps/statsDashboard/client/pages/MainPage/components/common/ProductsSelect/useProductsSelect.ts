import { ProductEngineType } from '@nadohq/client';
import { ChainEnvWithEdge, TokenIconMetadata } from '@nadohq/react-client';
import { SelectValueWithIdentifier, useSelect } from '@nadohq/web-ui';
import { EdgeAnnotatedMarket } from 'client/hooks/types';
import { getMarketName } from 'client/utils/getMarketName';
import { getSpotMarketTokenName } from 'client/utils/getSpotMarketTokenName';
import { first } from 'lodash';
import { useMemo, useState } from 'react';

export interface ProductSelectValue extends SelectValueWithIdentifier {
  displayName: string;
  icon: TokenIconMetadata;
  symbol: string;
  productId: number;
  chainEnv: ChainEnvWithEdge;
}

interface Params {
  markets: EdgeAnnotatedMarket[] | undefined;
}

function getProductOptionId(product: EdgeAnnotatedMarket) {
  return `${product.chainEnv}_${product.productId}`;
}

function getProductSelectValue(
  market: EdgeAnnotatedMarket,
): ProductSelectValue {
  if (market.type === ProductEngineType.SPOT) {
    return {
      selectId: getProductOptionId(market),
      displayName: getSpotMarketTokenName(market),
      icon: market.metadata.token.icon,
      symbol: market.metadata.token.symbol,
      productId: market.productId,
      chainEnv: market.chainEnv,
    };
  }

  return {
    selectId: getProductOptionId(market),
    displayName: getMarketName(market),
    icon: market.metadata.icon,
    symbol: market.metadata.symbol,
    productId: market.productId,
    chainEnv: market.chainEnv,
  };
}

export function useProductsSelect({ markets }: Params) {
  const [selectedProduct, setSelectedProduct] = useState<
    ProductSelectValue | undefined
  >();

  const productOptions = useMemo(() => {
    return (
      markets?.map((market) => {
        const productSelectValue = getProductSelectValue(market);

        return {
          label: productSelectValue.displayName,
          value: productSelectValue,
        };
      }) ?? []
    );
  }, [markets]);

  // Set initial selection when productOptions change or set initial selection
  if (!selectedProduct && productOptions.length > 0) {
    setSelectedProduct(first(productOptions)?.value);
  }

  const {
    selectOptions,
    selectedOption,
    open,
    onValueChange,
    value,
    onOpenChange,
  } = useSelect({
    selectedValue: selectedProduct,
    onSelectedValueChange: setSelectedProduct,
    options: productOptions,
  });

  return {
    selectOptions,
    selectedOption,
    open,
    onValueChange,
    value,
    onOpenChange,
  };
}
