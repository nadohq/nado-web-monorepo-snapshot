import { Divider, Icons } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SwitcherDropdownItemButton } from 'client/components/SwitcherDropdownItemButton';
import { ROUTES } from 'client/modules/app/consts/routes';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { SubaccountSwitcherContent } from 'client/modules/app/navBar/accountInfo/SubaccountSwitcherContent';
import { AccountDropdownCurrentProfileCard } from 'client/modules/app/navBar/accountInfo/components/AccountDropdownCurrentProfileCard';
import { AccountDropdownHeader } from 'client/modules/app/navBar/accountInfo/components/AccountDropdownHeader';
import { AccountDropdownUserCTA } from 'client/modules/app/navBar/accountInfo/components/AccountDropdownUserCTA';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function AccountDropdownContent() {
  const { t } = useTranslation();
  const { show } = useDialog();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <AccountDropdownHeader />
      <AccountDropdownUserCTA />
      <AccountDropdownCurrentProfileCard />
      <DropdownMenu.Group asChild>
        <div className="flex flex-col gap-y-0.5">
          <SwitcherDropdownItemButton
            startIcon={<Icons.ArrowDownLeft size={20} />}
            label={t(($) => $.buttons.deposit)}
            onClick={() =>
              show({
                type: 'deposit_options',
                params: {},
              })
            }
          />
          <SwitcherDropdownItemButton
            startIcon={<Icons.ArrowUpRight size={20} />}
            label={t(($) => $.buttons.withdraw)}
            onClick={() =>
              show({
                type: 'withdraw',
                params: {},
              })
            }
          />
          <SwitcherDropdownItemButton
            startIcon={<Icons.ArrowsLeftRight size={20} />}
            label={t(($) => $.buttons.transferFunds)}
            onClick={() =>
              show({ type: 'subaccount_quote_transfer', params: {} })
            }
          />
          <SwitcherDropdownItemButton
            startIcon={<Icons.Files size={20} />}
            label={t(($) => $.buttons.history)}
            onClick={() => router.push(ROUTES.portfolio.history)}
          />
        </div>
      </DropdownMenu.Group>
      <Divider />
      <SubaccountSwitcherContent />
    </div>
  );
}
