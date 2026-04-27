import { formatNumber } from '@nadohq/react-client';
import { BaseTestProps, WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import { StackedTableCell } from 'client/components/DataTable/cells/StackedTableCell';
import { TableCellProps } from 'client/components/DataTable/cells/TableCell';
import { isTpSlMaxOrderSize } from 'client/modules/trading/tpsl/utils/isTpSlMaxOrderSize';
import { useTranslation } from 'react-i18next';

interface Props extends TableCellProps, BaseTestProps {
  filledBaseSize: BigNumber;
  totalBaseSize: BigNumber;
  symbol: string;
  formatSpecifier: string;
}

export function OrderFilledTotalCell({
  className,
  filledBaseSize,
  totalBaseSize,
  symbol,
  formatSpecifier,
  dataTestId,
  ...rest
}: WithClassnames<Props>) {
  const { t } = useTranslation();
  const formattedFilledSize = formatNumber(filledBaseSize, { formatSpecifier });
  const formattedTotalSize = formatNumber(totalBaseSize, { formatSpecifier });

  return (
    <StackedTableCell
      className={className}
      dataTestId={dataTestId}
      top={<>{formattedFilledSize} /</>}
      bottom={
        isTpSlMaxOrderSize(totalBaseSize) ? (
          t(($) => $.entirePosition)
        ) : (
          <AmountWithSymbol
            formattedAmount={formattedTotalSize}
            symbol={symbol}
          />
        )
      }
      {...rest}
    />
  );
}
