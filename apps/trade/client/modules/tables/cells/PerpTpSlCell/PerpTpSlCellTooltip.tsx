import { TriggerOrderInfo } from '@nadohq/client';
import { WithChildren } from '@nadohq/web-common';
import { BaseDefinitionTooltip } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { TpSlOrdersPreviewTable } from 'client/modules/trading/tpsl/components/TpSlOrdersPreviewTable';

interface Props extends WithChildren {
  orders: TriggerOrderInfo[] | undefined;
  productId: number;
  hasMultipleTpOrSlOrders: boolean;
  averageEntryPrice: BigNumber | undefined;
  positionAmount: BigNumber | undefined;
}

/**
 * Tooltip wrapper for TP/SL prices that shows a preview table when hovered.
 */
export function PerpTpSlCellTooltip({
  orders,
  productId,
  hasMultipleTpOrSlOrders,
  averageEntryPrice,
  positionAmount,
  children,
}: Props) {
  return (
    <BaseDefinitionTooltip
      title={null}
      decoration={hasMultipleTpOrSlOrders ? 'underline' : 'none'}
      // Overrides max-w in BaseDefinitionTooltip
      tooltipContentContainerClassName="max-w-max"
      content={
        <TpSlOrdersPreviewTable
          orders={orders}
          productId={productId}
          showActionButtons={false}
          gapClassName="gap-1"
          className="w-100"
          averageEntryPrice={averageEntryPrice}
          positionAmount={positionAmount}
        />
      }
      noHelpCursor
    >
      {children}
    </BaseDefinitionTooltip>
  );
}
