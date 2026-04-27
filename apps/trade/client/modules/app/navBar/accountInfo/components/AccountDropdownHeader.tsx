import { useEVMContext, useSubaccountContext } from '@nadohq/react-client';
import { useCopyText } from '@nadohq/web-common';
import { CopyIcon, Icons, LabelTooltip, TextButton } from '@nadohq/web-ui';
import { WalletDisplayName } from 'client/modules/app/navBar/accountInfo/components/WalletDisplayName';
import { useTranslation } from 'react-i18next';

export function AccountDropdownHeader() {
  const { t } = useTranslation();
  const {
    currentSubaccount: { address },
  } = useSubaccountContext();
  const { disconnect } = useEVMContext();
  const { isCopied, copy } = useCopyText();

  return (
    <div className="text-text-primary flex items-center justify-between gap-2 px-2 text-sm">
      <div className="flex items-center gap-1.5">
        <WalletDisplayName />
        <LabelTooltip
          label={
            isCopied
              ? t(($) => $.buttons.copied)
              : t(($) => $.buttons.copyAddress)
          }
          asChild
          noHelpCursor
        >
          <TextButton
            onClick={() => {
              copy(address);
            }}
            colorVariant="tertiary"
          >
            <CopyIcon
              size={16}
              isCopied={isCopied}
              dataTestId="navbar-account-dropdown-copy-address-button"
            />
          </TextButton>
        </LabelTooltip>
      </div>
      <TextButton
        endIcon={<Icons.Power size={16} />}
        className="gap-1 text-xs"
        onClick={disconnect}
        colorVariant="secondary"
      >
        {t(($) => $.buttons.disconnect)}
      </TextButton>
    </div>
  );
}
