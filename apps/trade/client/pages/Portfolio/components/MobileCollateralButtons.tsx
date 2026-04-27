import { IconButton, Icons, PrimaryButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';

export function MobileCollateralButtons({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation();
  const { show } = useDialog();

  return (
    <div className="flex gap-x-1 px-2">
      <IconButton
        size="sm"
        icon={Icons.ArrowsLeftRight}
        disabled={disabled}
        onClick={() => {
          show({ type: 'subaccount_quote_transfer', params: {} });
        }}
      />
      <IconButton
        size="sm"
        icon={Icons.ArrowUpRight}
        disabled={disabled}
        onClick={() => {
          show({ type: 'withdraw', params: {} });
        }}
      />
      <PrimaryButton
        size="sm"
        disabled={disabled}
        onClick={() => {
          show({ type: 'deposit_options', params: {} });
        }}
      >
        {t(($) => $.buttons.deposit)}
      </PrimaryButton>
    </div>
  );
}
