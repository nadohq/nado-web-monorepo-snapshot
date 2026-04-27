import { PrimaryButton, SecondaryButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';

export function DesktopCollateralButtons({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation();
  const { show } = useDialog();

  return (
    <div className="grid grid-cols-3 gap-x-2">
      <SecondaryButton
        size="sm"
        disabled={disabled}
        onClick={() => {
          show({ type: 'subaccount_quote_transfer', params: {} });
        }}
        dataTestId="portfolio-collateral-buttons-transfer"
      >
        {t(($) => $.buttons.transfer)}
      </SecondaryButton>
      <SecondaryButton
        size="sm"
        disabled={disabled}
        onClick={() => {
          show({ type: 'withdraw', params: {} });
        }}
        dataTestId="portfolio-collateral-buttons-withdraw"
      >
        {t(($) => $.buttons.withdraw)}
      </SecondaryButton>
      <PrimaryButton
        size="sm"
        disabled={disabled}
        onClick={() => {
          show({ type: 'deposit_options', params: {} });
        }}
        dataTestId="portfolio-collateral-buttons-deposit"
      >
        {t(($) => $.buttons.deposit)}
      </PrimaryButton>
    </div>
  );
}
