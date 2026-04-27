import { CloseAllPositionsFilter } from 'client/hooks/execute/placeOrder/useExecuteCloseAllPositions';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { CloseAllPositionsActionButtons } from 'client/modules/trading/closeAllPositions/CloseAllPositionsActionButtons';
import { CloseAllPositionsEstimatedPnl } from 'client/modules/trading/closeAllPositions/CloseAllPositionsEstimatedPnl';
import { useCloseAllPositionsDialog } from 'client/modules/trading/closeAllPositions/hooks/useCloseAllPositionsDialog';
import { useTranslation } from 'react-i18next';

export type CloseAllPositionsDialogParams = CloseAllPositionsFilter;

export function CloseAllPositionsDialog({
  productIds,
  onlySide,
}: CloseAllPositionsDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const { onSubmit, buttonState, totalEstimatedPnlUsd, totalEstimatedRoeFrac } =
    useCloseAllPositionsDialog({ productIds, onlySide });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.closeAllPositions)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <p>
          {t(($) => $.confirmCloseAllPositionsAtMarketPrice, {
            context: onlySide,
          })}
        </p>
        <CloseAllPositionsEstimatedPnl
          totalEstimatedPnlUsd={totalEstimatedPnlUsd}
          totalEstimatedRoeFrac={totalEstimatedRoeFrac}
        />
        <CloseAllPositionsActionButtons
          hide={hide}
          closeAllPositions={onSubmit}
          buttonState={buttonState}
        />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
