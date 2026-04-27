import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarketDetailsDialog } from 'client/modules/tables/detailDialogs/MarketDetailsDialog';
import { PreLiquidationDetailsDialog } from 'client/modules/tables/detailDialogs/PreLiquidationDetailsDialog/PreLiquidationDetailsDialog';
import { SpotMoneyMarketDetailsDialog } from 'client/modules/tables/detailDialogs/SpotMoneyMarketDetailsDialog/SpotMoneyMarketDetailsDialog';

/**
 * Typically shown on tablet/mobile when clicking on a table row
 */
export function DetailDialogs() {
  const { currentDialog } = useDialog();

  return (
    <>
      {currentDialog?.type === 'spot_money_market_details' && (
        <SpotMoneyMarketDetailsDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'market_details' && (
        <MarketDetailsDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'pre_liquidation_details' && (
        <PreLiquidationDetailsDialog {...currentDialog.params} />
      )}
    </>
  );
}
