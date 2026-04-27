import { EditOrderViaChartDialog } from 'client/modules/app/dialogs/EditOrderViaChartDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { CustomizableTableColumnsDialog } from 'client/modules/tables/customizableTables/CustomizableTableColumnsDialog/CustomizableTableColumnsDialog';
import { CloseAllPositionsDialog } from 'client/modules/trading/closeAllPositions/CloseAllPositionsDialog';
import { ClosePositionDialog } from 'client/modules/trading/closePosition/ClosePositionDialog';
import { IsolatedAdjustMarginDialog } from 'client/modules/trading/components/dialogs/IsolatedAdjustMarginDialog/IsolatedAdjustMarginDialog';
import { PreviewScaledOrdersDialog } from 'client/modules/trading/components/scaledOrder/PreviewScaledOrdersDialog/PreviewScaledOrdersDialog';
import { TwapExecutionsDialog } from 'client/modules/trading/components/twap/TwapExecutionsDialog/TwapExecutionsDialog';
import { PerpPnlSocialSharingDialog } from 'client/modules/trading/perpPnlSocialSharing/PerpPnlSocialSharingDialog';
import { ReversePositionDialog } from 'client/modules/trading/reversePosition/ReversePositionDialog';
import { AddTpSlDialog } from 'client/modules/trading/tpsl/addTpSlDialog/AddTpSlDialog';
import { ManageTpSlDialog } from 'client/modules/trading/tpsl/manageTpSlDialog/ManageTpSlDialog';
import { ModifyTpSlDialog } from 'client/modules/trading/tpsl/modifyTpSlDialog/ModifyTpSlDialog';
import { PerpLeverageDialog } from 'client/pages/PerpTrading/components/PerpLeverageDialog/PerpLeverageDialog';
import { PerpMarginModeDialog } from 'client/pages/PerpTrading/components/PerpMarginModeDialog/PerpMarginModeDialog';
import { SpotLeverageOnDialog } from 'client/pages/SpotTrading/components/SpotLeverageOnDialog';

export function TradingDialogs() {
  const { currentDialog } = useDialog();

  return (
    <>
      {currentDialog?.type === 'close_position' && (
        <ClosePositionDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'reverse_position' && (
        <ReversePositionDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'adjust_iso_margin' && (
        <IsolatedAdjustMarginDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'perp_margin_mode' && (
        <PerpMarginModeDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'perp_leverage' && (
        <PerpLeverageDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'perp_pnl_social_sharing' && (
        <PerpPnlSocialSharingDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'add_tp_sl' && (
        <AddTpSlDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'manage_tp_sl' && (
        <ManageTpSlDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'modify_tp_sl' && (
        <ModifyTpSlDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'close_all_positions' && (
        <CloseAllPositionsDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'spot_leverage_on' && <SpotLeverageOnDialog />}
      {currentDialog?.type === 'edit_order_via_chart' && (
        <EditOrderViaChartDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'preview_scaled_orders' && (
        <PreviewScaledOrdersDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'twap_executions' && (
        <TwapExecutionsDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'customize_table_columns' && (
        <CustomizableTableColumnsDialog {...currentDialog.params} />
      )}
    </>
  );
}
