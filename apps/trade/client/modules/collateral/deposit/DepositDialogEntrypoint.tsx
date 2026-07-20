import { DepositOptionsDialog } from 'client/modules/collateral/deposit/DepositOptionsDialog/DepositOptionsDialog';
import { FunDepositCheckoutLauncher } from 'client/modules/collateral/funkit/deposit/FunDepositCheckoutLauncher';
import { useEnableClassicDepositUi } from 'client/modules/trading/hooks/useEnableClassicDepositUi';

export interface DepositDialogEntrypointParams {
  initialProductId?: number;
}

export function DepositDialogEntrypoint({
  initialProductId,
}: DepositDialogEntrypointParams) {
  const { enableClassicDepositUi, didLoadPersistedValue } =
    useEnableClassicDepositUi();

  if (!didLoadPersistedValue) {
    return null;
  }

  if (enableClassicDepositUi) {
    return <DepositOptionsDialog initialProductId={initialProductId} />;
  }

  return <FunDepositCheckoutLauncher initialProductId={initialProductId} />;
}
