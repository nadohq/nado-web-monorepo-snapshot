import { ProductEngineType } from '@nadohq/client';
import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { SpotLiquidationLabel } from 'client/modules/tables/components/SpotLiquidationLabel';

interface LiquidationProductInfoProps extends WithClassnames {
  productType: ProductEngineType;
  productId: number;
  productLabel: string;
  isIsolated: boolean | undefined;
  amountLiquidated: BigNumber;
}

export function LiquidationProductInfo({
  productType,
  productId,
  productLabel,
  isIsolated,
  amountLiquidated,
}: LiquidationProductInfoProps) {
  switch (productType) {
    case ProductEngineType.PERP:
      return (
        <PerpPositionLabel
          productId={productId}
          marketName={productLabel}
          amountForSide={amountLiquidated}
          marginModeType={isIsolated ? 'isolated' : 'cross'}
          isoLeverage={undefined}
        />
      );
    case ProductEngineType.SPOT:
      return (
        <SpotLiquidationLabel
          productId={productId}
          productName={productLabel}
          amountLiquidated={amountLiquidated}
        />
      );
  }
}
