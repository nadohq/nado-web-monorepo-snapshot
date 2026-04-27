import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { StackedTableCell } from 'client/components/DataTable/cells/StackedTableCell';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';

interface Props {
  priceIncrement: BigNumber | undefined;
  currentPrice: BigNumber | undefined;
  priceChangeFrac: BigNumber | undefined;
}

export function MobileMarketSwitcherStackedPriceCell({
  currentPrice,
  priceChangeFrac,
  priceIncrement,
}: Props) {
  const color = getSignDependentColorClassName(priceChangeFrac);

  return (
    <StackedTableCell
      top={formatNumber(currentPrice, {
        formatSpecifier: getMarketPriceFormatSpecifier(priceIncrement),
      })}
      bottom={
        <span className={joinClassNames('text-2xs', color)}>
          {formatNumber(priceChangeFrac, {
            formatSpecifier: PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
          })}
        </span>
      }
    />
  );
}
