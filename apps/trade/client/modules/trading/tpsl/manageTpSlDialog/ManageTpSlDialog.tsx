import {
  PrimaryButton,
  ScrollShadowsContainer,
  SecondaryButton,
} from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { TpSlOrdersPreviewTable } from 'client/modules/trading/tpsl/components/TpSlOrdersPreviewTable';
import { useManageTpSlDialog } from 'client/modules/trading/tpsl/manageTpSlDialog/hooks/useManageTpSlDialog';
import { ManageTpSlDialogParams } from 'client/modules/trading/tpsl/manageTpSlDialog/types';
import { useTranslation } from 'react-i18next';

export function ManageTpSlDialog({ productId, isIso }: ManageTpSlDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const {
    orders,
    canCancelAllOrders,
    handleCancelAll,
    cancelAllStatus,
    handleAddTpSl,
    averageEntryPrice,
    positionAmount,
  } = useManageTpSlDialog({ productId, isIso });

  const ordersContent = (() => {
    if (orders.length === 0) {
      return (
        <div className="text-text-tertiary flex h-20 items-center justify-center">
          {t(($) => $.emptyPlaceholders.noTpSlOrders)}
        </div>
      );
    }

    return (
      <ScrollShadowsContainer orientation="horizontal">
        <TpSlOrdersPreviewTable
          orders={orders}
          productId={productId}
          gapClassName="gap-3"
          showActionButtons
          averageEntryPrice={averageEntryPrice}
          positionAmount={positionAmount}
        />
      </ScrollShadowsContainer>
    );
  })();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.manageTpSl)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        {ordersContent}
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-x-3">
          <SecondaryButton
            disabled={!canCancelAllOrders}
            isLoading={cancelAllStatus === 'pending'}
            onClick={handleCancelAll}
            destructive
            dataTestId="manage-tp-sl-dialog-cancel-all-button"
          >
            {t(($) => $.buttons.cancelAll)}
          </SecondaryButton>
          <PrimaryButton
            onClick={handleAddTpSl}
            dataTestId="manage-tp-sl-dialog-add-button"
          >
            {t(($) => $.buttons.add)}
          </PrimaryButton>
        </div>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
