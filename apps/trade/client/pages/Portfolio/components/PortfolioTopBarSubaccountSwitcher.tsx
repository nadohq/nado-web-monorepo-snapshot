import { useSubaccountContext } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { DropdownUi, UpDownChevronIcon } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ProfileAvatarIcon } from 'client/modules/subaccounts/components/ProfileAvatarIcon';
import { SubaccountSwitcherDropdownContent } from 'client/modules/subaccounts/components/SubaccountSwitcherDropdownContent';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function PortfolioTopBarSubaccountSwitcher({
  className,
  disabled,
}: WithClassnames<{ disabled?: boolean }>) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const {
    currentSubaccountProfile: { avatar, username },
  } = useSubaccountContext();

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger disabled={disabled} asChild>
        <DropdownUi.Trigger
          borderRadiusVariant="xs"
          className={className}
          disabled={disabled}
          open={open}
          startIcon={<ProfileAvatarIcon avatar={avatar} size={36} />}
          endIcon={
            <UpDownChevronIcon className="text-text-primary" open={open} />
          }
        >
          <div className="flex flex-1 flex-col gap-y-1 overflow-hidden text-left">
            <div className="text-text-primary truncate text-sm font-medium lg:text-xl">
              {username}
            </div>
            <div className="text-text-tertiary text-3xs lg:text-sm">
              {t(($) => $.account)}
            </div>
          </div>
        </DropdownUi.Trigger>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={8} align="start" asChild>
        <SubaccountSwitcherDropdownContent className="w-48" />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
