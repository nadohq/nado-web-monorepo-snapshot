import { ProductEngineType } from '@nadohq/client';
import {
  PresetNumberFormatSpecifier,
  TokenIconMetadata,
} from '@nadohq/react-client';
import { Pill } from '@nadohq/web-ui';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { NewIcon } from 'client/components/Icons/NewIcon';
import { ProductTypePill } from 'client/modules/trading/components/ProductTypePill';
import { formatLeverage } from 'client/utils/formatLeverage';
import Image from 'next/image';

interface Props {
  marketName: string;
  productType: ProductEngineType;
  symbol: string;
  icon: TokenIconMetadata;
  isNew: boolean;
  maxLeverage: number | undefined;
}

export function TradingMarketSwitcherProductInfoCell({
  marketName,
  productType,
  symbol,
  icon,
  isNew,
  maxLeverage,
}: Props) {
  return (
    <TableCell className="flex items-center gap-x-1.5">
      <Image src={icon.asset} className="h-auto w-5" alt={symbol} />
      <div className="flex flex-col items-start gap-x-1 gap-y-1.5 lg:flex-row lg:items-center">
        <span
          className="text-text-primary text-xs font-medium"
          data-testid={`trading-market-switcher-market-name-cell-${marketName}`}
        >
          {marketName}
        </span>
        <div className="flex items-center gap-x-1">
          {maxLeverage != null && (
            <Pill
              colorVariant="secondary"
              sizeVariant="2xs"
              dataTestId="trading-market-switcher-market-leverage-cell"
            >
              {formatLeverage(
                maxLeverage,
                PresetNumberFormatSpecifier.NUMBER_INT,
              )}
            </Pill>
          )}
          <ProductTypePill
            productType={productType}
            colorVariant="secondary"
            dataTestId="trading-market-switcher-product-type-pill"
          />
          {isNew && <NewIcon />}
        </div>
      </div>
    </TableCell>
  );
}
