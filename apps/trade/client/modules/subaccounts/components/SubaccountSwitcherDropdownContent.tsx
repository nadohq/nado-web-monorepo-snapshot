import {
  formatNumber,
  PresetNumberFormatSpecifier,
  useSubaccountContext,
} from '@nadohq/react-client';
import { joinClassNames, WithRef } from '@nadohq/web-common';
import {
  Divider,
  DropdownUi,
  ScrollShadowsContainer,
  TextButton,
} from '@nadohq/web-ui';
import {
  DropdownMenuContentProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';
import { SwitcherDropdownItemButton } from 'client/components/SwitcherDropdownItemButton';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ProfileAvatarIcon } from 'client/modules/subaccounts/components/ProfileAvatarIcon';
import { useAllSubaccountsWithMetrics } from 'client/modules/subaccounts/hooks/useAllSubaccountsWithMetrics';
import { useTranslation } from 'react-i18next';

export function SubaccountSwitcherDropdownContent({
  className,
  ...rest
}: WithRef<DropdownMenuContentProps, HTMLDivElement>) {
  const { t } = useTranslation();
  const { currentSubaccount, setCurrentSubaccountName } =
    useSubaccountContext();
  const subaccountsWithMetrics = useAllSubaccountsWithMetrics();
  const { push } = useDialog();

  return (
    <DropdownUi.Content
      className={joinClassNames('flex flex-col p-3 lg:gap-y-3', className)}
      header={
        <DropdownMenuLabel className="text-xs">
          {t(($) => $.yourAccounts)}
        </DropdownMenuLabel>
      }
      {...rest}
    >
      <DropdownMenuGroup asChild>
        <ScrollShadowsContainer
          orientation="vertical"
          className="flex max-h-72 flex-col gap-y-0.5 text-sm"
        >
          {subaccountsWithMetrics.map(
            ({ subaccountName, profile, portfolioValueUsd }) => {
              const isActive = subaccountName === currentSubaccount.name;
              const { username, avatar } = profile;

              return (
                <SwitcherDropdownItemButton
                  key={subaccountName}
                  className="gap-x-3"
                  label={username}
                  sublabel={formatNumber(portfolioValueUsd, {
                    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
                  })}
                  active={isActive}
                  startIcon={
                    <ProfileAvatarIcon
                      avatar={avatar}
                      size={32}
                      subaccountName={subaccountName}
                    />
                  }
                  onClick={() => {
                    if (!isActive) {
                      setCurrentSubaccountName(subaccountName);
                    }
                  }}
                />
              );
            },
          )}
        </ScrollShadowsContainer>
      </DropdownMenuGroup>
      <DropdownMenuSeparator asChild>
        <Divider />
      </DropdownMenuSeparator>
      <DropdownMenuGroup className="flex flex-col items-start gap-y-3 text-xs">
        <DropdownMenuItem asChild>
          <TextButton
            colorVariant="secondary"
            onClick={() => push({ type: 'manage_subaccounts', params: {} })}
          >
            {t(($) => $.buttons.addAndManageAccounts)}
          </TextButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <TextButton
            colorVariant="secondary"
            onClick={() =>
              push({ type: 'subaccount_quote_transfer', params: {} })
            }
          >
            {t(($) => $.buttons.transferFunds)}
          </TextButton>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownUi.Content>
  );
}
