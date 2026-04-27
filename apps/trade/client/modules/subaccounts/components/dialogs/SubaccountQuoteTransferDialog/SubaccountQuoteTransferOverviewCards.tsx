import {
  AppSubaccount,
  formatNumber,
  PresetNumberFormatSpecifier,
  Token,
} from '@nadohq/react-client';
import { IconButton, Icons } from '@nadohq/web-ui';
import { StatusIndicator } from 'client/components/StatusIndicator';
import { ProfileAvatarIcon } from 'client/modules/subaccounts/components/ProfileAvatarIcon';
import { QuoteTransferSubaccount } from 'client/modules/subaccounts/hooks/useSubaccountQuoteTransferForm/useSubaccountQuoteTransferFormData';
import { useTranslation } from 'react-i18next';

interface Props {
  currentSubaccount: AppSubaccount;
  senderSubaccount: QuoteTransferSubaccount;
  recipientSubaccount: QuoteTransferSubaccount;
  primaryQuoteToken: Token;
  onSwapAccounts: () => void;
}

export function SubaccountQuoteTransferOverviewCards({
  currentSubaccount,
  senderSubaccount,
  recipientSubaccount,
  primaryQuoteToken,
  onSwapAccounts,
}: Props) {
  const { t } = useTranslation();

  return (
    // `relative` for positioning the arrow icon.
    <div className="relative grid grid-cols-2 gap-x-3">
      <SubaccountOverviewCard
        subaccount={senderSubaccount}
        currentSubaccount={currentSubaccount}
        primaryQuoteToken={primaryQuoteToken}
      />
      <IconButton
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        icon={Icons.ArrowRight}
        size="xs"
        onClick={onSwapAccounts}
        tooltipLabel={t(($) => $.buttons.swapAccounts)}
      />
      <SubaccountOverviewCard
        subaccount={recipientSubaccount}
        currentSubaccount={currentSubaccount}
        primaryQuoteToken={primaryQuoteToken}
      />
    </div>
  );
}

interface SubaccountOverviewCardProps {
  subaccount: QuoteTransferSubaccount;
  currentSubaccount: AppSubaccount;
  primaryQuoteToken: Token;
}

function SubaccountOverviewCard({
  subaccount,
  currentSubaccount,
  primaryQuoteToken,
}: SubaccountOverviewCardProps) {
  return (
    <div className="bg-surface-1 text-text-primary flex flex-col gap-y-3 rounded-sm p-3">
      <div className="flex items-center justify-center gap-x-2">
        <ProfileAvatarIcon
          avatar={subaccount.profile.avatar}
          subaccountName={subaccount.subaccountName}
          size={24}
        />
        <span className="truncate">{subaccount.profile.username}</span>
        {subaccount.subaccountName === currentSubaccount.name && (
          <StatusIndicator colorVariant="positive" />
        )}
      </div>
      <div className="flex justify-center gap-x-1 text-xs">
        <span className="truncate">
          {formatNumber(subaccount.decimalAdjustedQuoteProductBalance, {
            formatSpecifier: PresetNumberFormatSpecifier.NUMBER_2DP,
          })}
        </span>
        <span>{primaryQuoteToken.symbol}</span>
      </div>
    </div>
  );
}
