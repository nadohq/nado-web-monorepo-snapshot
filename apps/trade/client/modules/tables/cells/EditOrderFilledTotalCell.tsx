import { formatNumber } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { EditOrderFieldPopover } from 'client/modules/tables/components/EditOrderFieldPopover/EditOrderFieldPopover';
import { StackedValues } from 'client/modules/tables/components/StackedValues';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';
import { useTranslation } from 'react-i18next';

interface Props extends TableCellProps {
  filledBaseSize: BigNumber;
  /** Signed total amount (negative for shorts) */
  totalBaseAmount: BigNumber;
  symbol: string;
  formatSpecifier: string;
  productId: number;
  digest: string;
  /** Whether this is a trigger order (stop market, stop limit, TP/SL) */
  isTrigger: boolean;
  /** Order price used for minimum notional validation */
  orderPrice: BigNumber;
}

export function EditOrderFilledTotalCell({
  filledBaseSize,
  totalBaseAmount,
  symbol,
  formatSpecifier,
  productId,
  digest,
  isTrigger,
  orderPrice,
  ...rest
}: Props) {
  const { t } = useTranslation();
  const totalBaseSize = totalBaseAmount.abs();
  const formattedFilledSize = formatNumber(filledBaseSize, { formatSpecifier });
  const formattedTotalSize = formatNumber(totalBaseSize, { formatSpecifier });
  const isEntirePosition = isTpSlMaxOrderSize(totalBaseSize);

  return (
    <TableCell {...rest}>
      <StackedValues
        top={<>{formattedFilledSize} /</>}
        bottom={
          isEntirePosition ? (
            t(($) => $.entirePosition)
          ) : (
            <AmountWithSymbol
              formattedAmount={formattedTotalSize}
              symbol={symbol}
            />
          )
        }
      />
      {!isEntirePosition && (
        <EditOrderFieldPopover
          currentValue={totalBaseAmount}
          productId={productId}
          digest={digest}
          isTrigger={isTrigger}
          field="amount"
          triggerClassName="p-2 text-xs"
          orderPrice={orderPrice}
        />
      )}
    </TableCell>
  );
}
