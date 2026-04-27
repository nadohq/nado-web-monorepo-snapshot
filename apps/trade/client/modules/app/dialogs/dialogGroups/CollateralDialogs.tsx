import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { CctpBridgeDialog } from 'client/modules/collateral/deposit/CctpBridgeDialog/CctpBridgeDialog';
import { DepositOptionsDialog } from 'client/modules/collateral/deposit/DepositOptionsDialog/DepositOptionsDialog';
import { DirectDepositReceiveDialog } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/DirectDepositReceiveDialog';
import { LiFiWidgetDialog } from 'client/modules/collateral/deposit/LiFiWidgetDialog/LiFiWidgetDialog';
import { Usdt0BridgeDialog } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/Usdt0BridgeDialog';
import { WalletDepositDialog } from 'client/modules/collateral/deposit/WalletDepositDialog/WalletDepositDialog';
import { FastWithdrawDialog } from 'client/modules/collateral/fastWithdraw/components/FastWithdrawDialog';
import { RepayDialog } from 'client/modules/collateral/repay/RepayDialog';
import { WithdrawDialog } from 'client/modules/collateral/withdraw/components/WithdrawDialog';

export function CollateralDialogs() {
  const { currentDialog } = useDialog();

  return (
    <>
      {currentDialog?.type === 'wallet_deposit' && (
        <WalletDepositDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'deposit_options' && (
        <DepositOptionsDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'withdraw' && (
        <WithdrawDialog
          {...currentDialog.params}
          defaultEnableBorrows={false}
        />
      )}
      {currentDialog?.type === 'fast_withdraw' && (
        <FastWithdrawDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'repay' && (
        <RepayDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'borrow' && (
        <WithdrawDialog {...currentDialog.params} defaultEnableBorrows />
      )}
      {currentDialog?.type === 'lifi_widget' && (
        <LiFiWidgetDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'usdt0_bridge' && (
        <Usdt0BridgeDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'dda_receive' && (
        <DirectDepositReceiveDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'cctp_bridge' && (
        <CctpBridgeDialog {...currentDialog.params} />
      )}
    </>
  );
}
