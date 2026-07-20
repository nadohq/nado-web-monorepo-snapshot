import {
  formatNumber,
  NumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { StackedValues } from 'client/modules/tables/components/StackedValues';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';

interface Props {
  priceFormatSpecifier: NumberFormatSpecifier;
  currentPrice: BigNumber | undefined;
  priceChangeFrac: BigNumber | undefined;
}

export function MobileMarketSwitcherStackedPriceCell({
  currentPrice,
  priceChangeFrac,
  priceFormatSpecifier,
}: Props) {
  const color = getSignDependentColorClassName(priceChangeFrac);

  return (
    <TableCell>
      <StackedValues
        className="items-end"
        top={formatNumber(currentPrice, {
          formatSpecifier: priceFormatSpecifier,
        })}
        bottom={
          <span className={color}>
            {formatNumber(priceChangeFrac, {
              formatSpecifier:
                PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
            })}
          </span>
        }
      />
    </TableCell>
  );
}
