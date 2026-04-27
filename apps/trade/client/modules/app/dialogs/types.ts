import type { ActionSuccessDialogParams } from 'client/modules/app/dialogs/ActionSuccessDialog';
import type { EditOrderViaChartDialogProps } from 'client/modules/app/dialogs/EditOrderViaChartDialog';
import type { CctpBridgeDialogParams } from 'client/modules/collateral/deposit/CctpBridgeDialog/types';
import type { DepositOptionsDialogParams } from 'client/modules/collateral/deposit/DepositOptionsDialog/types';
import type { DirectDepositReceiveDialogParams } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/types';
import type { LiFiWidgetDialogParams } from 'client/modules/collateral/deposit/LiFiWidgetDialog/types';
import type { Usdt0BridgeDialogParams } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/types';
import type { WalletDepositDialogParams } from 'client/modules/collateral/deposit/WalletDepositDialog/types';
import type { FastWithdrawDialogParams } from 'client/modules/collateral/fastWithdraw/components/FastWithdrawDialog';
import type { RepayDialogParams } from 'client/modules/collateral/repay/RepayDialog';
import type { WithdrawDialogParams } from 'client/modules/collateral/withdraw/components/WithdrawDialog';
import type { PointsTierShareDialogParams } from 'client/modules/points/components/PointsTierShareDialog';
import type { EditSubaccountProfileDialogParams } from 'client/modules/subaccounts/components/dialogs/EditSubaccountProfileDialog/EditSubaccountProfileDialog';
import type { SubaccountQuoteTransferDialogParams } from 'client/modules/subaccounts/components/dialogs/SubaccountQuoteTransferDialog/SubaccountQuoteTransferDialog';
import type { CustomizableTableColumnsDialogParams } from 'client/modules/tables/customizableTables/CustomizableTableColumnsDialog/CustomizableTableColumnsDialog';
import type { MarketDetailsDialogParams } from 'client/modules/tables/detailDialogs/MarketDetailsDialog';
import type { PreLiquidationDetailsDialogParams } from 'client/modules/tables/detailDialogs/PreLiquidationDetailsDialog/types';
import type { SpotMoneyMarketDetailsDialogParams } from 'client/modules/tables/detailDialogs/SpotMoneyMarketDetailsDialog/SpotMoneyMarketDetailsDialog';
import type { CloseAllPositionsDialogParams } from 'client/modules/trading/closeAllPositions/CloseAllPositionsDialog';
import type { ClosePositionDialogParams } from 'client/modules/trading/closePosition/ClosePositionDialog';
import type { IsolatedAdjustMarginDialogParams } from 'client/modules/trading/components/dialogs/IsolatedAdjustMarginDialog/IsolatedAdjustMarginDialog';
import type { PreviewScaledOrdersDialogParams } from 'client/modules/trading/components/scaledOrder/PreviewScaledOrdersDialog/PreviewScaledOrdersDialog';
import type { TwapExecutionsDialogParams } from 'client/modules/trading/components/twap/TwapExecutionsDialog/TwapExecutionsDialog';
import type { PerpPnlSocialSharingDialogParams } from 'client/modules/trading/perpPnlSocialSharing/PerpPnlSocialSharingDialog';
import type { ReversePositionDialogParams } from 'client/modules/trading/reversePosition/ReversePositionDialog';
import type { AddTpSlDialogParams } from 'client/modules/trading/tpsl/addTpSlDialog/AddTpSlDialog';
import type { ManageTpSlDialogParams } from 'client/modules/trading/tpsl/manageTpSlDialog/types';
import type { ModifyTpSlDialogParams } from 'client/modules/trading/tpsl/modifyTpSlDialog/types';
import type { UtmCampaignDialogParams } from 'client/modules/utm/dialogs/UtmCampaignDialog/UtmCampaignDialog';
import type { PerpLeverageDialogParams } from 'client/pages/PerpTrading/components/PerpLeverageDialog/PerpLeverageDialog';
import type { PerpMarginModeDialogParams } from 'client/pages/PerpTrading/components/PerpMarginModeDialog/PerpMarginModeDialog';
import type { ExportHistoryDialogParams } from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import type { EmptyObject } from 'type-fest';

export type DialogParams =
  | {
      type: 'location_restricted';
      params: EmptyObject;
    }
  // Connection flow is: Connect -> Terms of Use -> Key Features
  | {
      type: 'connect';
      params: EmptyObject;
    }
  | {
      type: 'connect_custom_wallet';
      params: EmptyObject;
    }
  | {
      type: 'terms_of_use';
      params: EmptyObject;
    }
  | {
      type: 'key_features';
      params: EmptyObject;
    }
  | {
      type: 'change_subaccount';
      params: EmptyObject;
    }
  | {
      type: 'edit_user_profile';
      params: EditSubaccountProfileDialogParams;
    }
  | {
      type: 'settings';
      params: EmptyObject;
    }
  | {
      type: 'signature_mode_settings';
      params: EmptyObject;
    }
  | {
      type: 'signature_mode_slow_mode_settings';
      params: EmptyObject;
    }
  | {
      type: 'single_signature_reapproval';
      params: EmptyObject;
    }
  | {
      type: 'notifi_settings';
      params: EmptyObject;
    }
  | {
      type: 'help_center';
      params: EmptyObject;
    }
  | {
      type: 'wallet_deposit';
      params: WalletDepositDialogParams;
    }
  | {
      type: 'deposit_options';
      params: DepositOptionsDialogParams;
    }
  | {
      type: 'withdraw';
      params: WithdrawDialogParams;
    }
  | {
      type: 'fast_withdraw';
      params: FastWithdrawDialogParams;
    }
  | {
      type: 'borrow';
      params: WithdrawDialogParams;
    }
  | {
      type: 'repay';
      params: RepayDialogParams;
    }
  | {
      type: 'close_position';
      params: ClosePositionDialogParams;
    }
  | {
      type: 'close_all_positions';
      params: CloseAllPositionsDialogParams;
    }
  | {
      type: 'reverse_position';
      params: ReversePositionDialogParams;
    }
  | {
      type: 'add_tp_sl';
      params: AddTpSlDialogParams;
    }
  | {
      type: 'manage_tp_sl';
      params: ManageTpSlDialogParams;
    }
  | {
      type: 'modify_tp_sl';
      params: ModifyTpSlDialogParams;
    }
  | {
      type: 'perp_margin_mode';
      params: PerpMarginModeDialogParams;
    }
  | {
      type: 'perp_leverage';
      params: PerpLeverageDialogParams;
    }
  | {
      type: 'spot_money_market_details';
      params: SpotMoneyMarketDetailsDialogParams;
    }
  | {
      type: 'perp_pnl_social_sharing';
      params: PerpPnlSocialSharingDialogParams;
    }
  | {
      type: 'market_details';
      params: MarketDetailsDialogParams;
    }
  | {
      type: 'action_success';
      params: ActionSuccessDialogParams;
    }
  | {
      type: 'utm_campaign_connect';
      params: UtmCampaignDialogParams;
    }
  | {
      type: 'epoch_breakdown';
      params: EmptyObject;
    }
  | {
      type: 'pre_liquidation_details';
      params: PreLiquidationDetailsDialogParams;
    }
  | {
      type: 'command_center';
      params: EmptyObject;
    }
  | {
      type: 'edit_order_via_chart';
      params: EditOrderViaChartDialogProps;
    }
  | {
      type: 'manage_subaccounts';
      params: EmptyObject;
    }
  | {
      type: 'create_subaccount';
      params: EmptyObject;
    }
  | {
      type: 'subaccount_quote_transfer';
      params: SubaccountQuoteTransferDialogParams;
    }
  | {
      type: 'adjust_iso_margin';
      params: IsolatedAdjustMarginDialogParams;
    }
  | {
      type: 'preview_scaled_orders';
      params: PreviewScaledOrdersDialogParams;
    }
  | {
      type: 'twap_executions';
      params: TwapExecutionsDialogParams;
    }
  | {
      type: 'export_history';
      params: ExportHistoryDialogParams;
    }
  | {
      type: 'generate_desktop_wallet_link_qr_code';
      params: EmptyObject;
    }
  | {
      type: 'connect_desktop_wallet_link';
      params: EmptyObject;
    }
  | {
      type: 'deposit_nlp_liquidity';
      params: EmptyObject;
    }
  | {
      type: 'withdraw_nlp_liquidity';
      params: EmptyObject;
    }
  | {
      type: 'spot_leverage_on';
      params: EmptyObject;
    }
  | {
      type: 'lifi_widget';
      params: LiFiWidgetDialogParams;
    }
  | {
      type: 'usdt0_bridge';
      params: Usdt0BridgeDialogParams;
    }
  | {
      type: 'dda_receive';
      params: DirectDepositReceiveDialogParams;
    }
  | {
      type: 'customize_table_columns';
      params: CustomizableTableColumnsDialogParams;
    }
  | {
      type: 'points_tier_share';
      params: PointsTierShareDialogParams;
    }
  | {
      type: 'cctp_bridge';
      params: CctpBridgeDialogParams;
    };

export type DialogType = DialogParams['type'];

export type CollateralDialogType = Extract<
  DialogType,
  'deposit_options' | 'withdraw' | 'borrow' | 'repay'
>;
