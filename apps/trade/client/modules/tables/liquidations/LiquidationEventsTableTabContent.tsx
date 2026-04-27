import { LiquidationEventsTable } from 'client/modules/tables/liquidations/LiquidationEventsTable/LiquidationEventsTable';
import { MobileLiquidationsTab } from 'client/modules/tables/liquidations/MobileLiquidationsTab';

interface Props {
  pageSize: number;
  showPagination: boolean;
  isMobile: boolean;
  productIds?: number[];
}

/**
 * Renders the liquidations table tab content, switching between mobile and desktop views.
 * Displays liquidation events with optional product filtering.
 */
export function LiquidationEventsTableTabContent({
  pageSize,
  showPagination,
  isMobile,
  productIds,
}: Props) {
  if (isMobile) {
    return (
      <MobileLiquidationsTab pageSize={pageSize} productIds={productIds} />
    );
  }

  return (
    <LiquidationEventsTable
      pageSize={pageSize}
      showPagination={showPagination}
      productIds={productIds}
    />
  );
}
