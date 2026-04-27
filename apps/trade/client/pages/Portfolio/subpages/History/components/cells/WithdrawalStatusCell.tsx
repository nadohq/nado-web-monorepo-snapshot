import { joinClassNames } from '@nadohq/web-common';
import { Icons, SecondaryButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { useTranslation } from 'react-i18next';

interface Props extends TableCellProps {
  amount: BigNumber;
  hasWithdrawPoolLiquidity: boolean;
  isProcessing: boolean | undefined;
  productId: number;
  submissionIndex: string;
}

export function WithdrawalStatusCell({
  isProcessing,
  className,
  hasWithdrawPoolLiquidity,
  productId,
  submissionIndex,
  amount,
  dataTestId,
  ...rest
}: Props) {
  const { t } = useTranslation();

  const { show } = useDialog();

  const cellContent = (() => {
    // In case when is not yet loaded. We don't render anything.
    if (isProcessing == null) {
      return null;
    }

    if (isProcessing) {
      return (
        <div className="flex items-center gap-x-6">
          <div className="flex items-center gap-x-1.5">
            <Icons.Clock size={16} className="text-text-tertiary" />
            <DefinitionTooltip
              definitionId="historicalWithdrawalsProcessing"
              dataTestId={dataTestId}
            >
              {t(($) => $.withdrawalStatus.processing)}
            </DefinitionTooltip>
          </div>
          {hasWithdrawPoolLiquidity && (
            <SecondaryButton
              size="xs"
              onClick={() =>
                show({
                  type: 'fast_withdraw',
                  params: {
                    productId,
                    submissionIndex,
                    withdrawalSize: amount.abs(),
                  },
                })
              }
            >
              {t(($) => $.buttons.fastWithdraw)}
            </SecondaryButton>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-x-1.5" data-testid={dataTestId}>
        <Icons.CheckCircle size={16} className="text-positive" />
        {t(($) => $.withdrawalStatus.confirmed)}
      </div>
    );
  })();

  return (
    <TableCell
      {...rest}
      className={joinClassNames('text-text-primary text-xs', className)}
    >
      {cellContent}
    </TableCell>
  );
}
