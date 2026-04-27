import { ProductEngineType } from '@nadohq/client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { LiquidationProductInfo } from 'client/modules/tables/liquidations/LiquidationEventsTable/cells/LiquidationAmountInfoCell/components/LiquidationProductInfo';
import { LiquidationSizeInfo } from 'client/modules/tables/liquidations/LiquidationEventsTable/cells/LiquidationAmountInfoCell/components/LiquidationSizeInfo';

interface LiquidationInfoProps extends WithClassnames {
  symbol: string;
  productId: number;
  productType: ProductEngineType;
  productLabel: string;
  sizeFormatSpecifier: string;
  isIsolated: boolean | undefined;
  amountLiquidated: BigNumber;
  amountLiquidatedValueUsd: BigNumber;
}

export function LiquidationInfo({
  className,
  symbol,
  productType,
  productId,
  productLabel,
  sizeFormatSpecifier,
  amountLiquidated,
  isIsolated,
  amountLiquidatedValueUsd,
}: LiquidationInfoProps) {
  return (
    <div className={joinClassNames('grid w-full grid-cols-2', className)}>
      <LiquidationProductInfo
        productId={productId}
        productType={productType}
        productLabel={productLabel}
        isIsolated={isIsolated}
        amountLiquidated={amountLiquidated}
      />
      <LiquidationSizeInfo
        amountLiquidated={amountLiquidated}
        amountFormatSpecifier={sizeFormatSpecifier}
        amountLiquidatedValueUsd={amountLiquidatedValueUsd}
        symbol={symbol}
      />
    </div>
  );
}
