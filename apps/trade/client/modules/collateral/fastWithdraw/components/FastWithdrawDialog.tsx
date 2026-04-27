import { BigNumber } from 'bignumber.js';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { FastWithdrawErrorPanel } from 'client/modules/collateral/fastWithdraw/components/FastWithdrawErrorPanel';
import { FastWithdrawInfoCollapsible } from 'client/modules/collateral/fastWithdraw/components/FastWithdrawInfoCollapsible';
import { FastWithdrawSubmitButton } from 'client/modules/collateral/fastWithdraw/components/FastWithdrawSubmitButton';
import { FastWithdrawSummary } from 'client/modules/collateral/fastWithdraw/components/FastWithdrawSummary';
import { useFastWithdrawForm } from 'client/modules/collateral/fastWithdraw/hooks/useFastWithdrawForm';
import { useTranslation } from 'react-i18next';

export interface FastWithdrawDialogParams {
  submissionIndex: string;
  productId: number;
  /** decimal adjusted withdrawal size */
  withdrawalSize: BigNumber;
}

export function FastWithdrawDialog({
  submissionIndex,
  productId,
  withdrawalSize,
}: FastWithdrawDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const {
    onSubmit,
    buttonState,
    withdrawalFeeAmount,
    productMetadata,
    formError,
  } = useFastWithdrawForm({
    submissionIndex,
    productId,
    withdrawalSize,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.fastWithdraw)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <FastWithdrawInfoCollapsible />
        {productMetadata && (
          <FastWithdrawSummary
            withdrawalSize={withdrawalSize}
            withdrawalFeeAmount={withdrawalFeeAmount}
            metadata={productMetadata}
          />
        )}
        <FastWithdrawErrorPanel formError={formError} />
        <FastWithdrawSubmitButton state={buttonState} onSubmit={onSubmit} />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
