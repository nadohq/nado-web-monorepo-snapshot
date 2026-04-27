import { PrimaryButton } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useShowUserDisclosure } from 'client/modules/localstorage/userState/useShowUserDisclosure';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface EditOrderViaChartDialogProps {
  onClose: () => void;
}

export function EditOrderViaChartDialog({
  onClose,
}: EditOrderViaChartDialogProps) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { shouldShow, dismiss } = useShowUserDisclosure(
    'edit_order_via_chart_dialog',
  );

  // Upon dialog close, `shouldShow` gets set to `false`, and this effect then runs.
  // Else, `shouldShow` is already `false` (i.e. previosly closed) and so we close immediately.
  // Using a layout effect so it runs before paint and we avoid a flash of incorrect state.
  useLayoutEffect(() => {
    if (!shouldShow) {
      // Reset the atom state for the dialog.
      hide();
      // Run callback (resolves promise so order can continue).
      onClose();
    }
  }, [shouldShow, hide, onClose]);

  return (
    <BaseAppDialog.Container onClose={dismiss}>
      <BaseAppDialog.Title onClose={dismiss}>
        {t(($) => $.dialogTitles.editOrderViaChart)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <p>{t(($) => $.editOrderViaChartDescription)}</p>
        <PrimaryButton onClick={dismiss}>
          {t(($) => $.buttons.ok)}
        </PrimaryButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
