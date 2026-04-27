import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DepositNlpLiquidityDialog } from 'client/modules/nlp/deposit/DepositNlpLiquidityDialog';
import { WithdrawNlpLiquidityDialog } from 'client/modules/nlp/withdraw/WithdrawNlpLiquidityDialog';

export function NlpDialogs() {
  const { currentDialog } = useDialog();

  return (
    <>
      {currentDialog?.type === 'deposit_nlp_liquidity' && (
        <DepositNlpLiquidityDialog />
      )}
      {currentDialog?.type === 'withdraw_nlp_liquidity' && (
        <WithdrawNlpLiquidityDialog />
      )}
    </>
  );
}
