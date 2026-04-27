import { PrimaryButton } from '@nadohq/web-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { AppNavItemButton } from 'client/modules/app/navBar/components/AppNavItemButton';
import { AppNavLogoLink } from 'client/modules/app/navBar/components/AppNavLogoLink';
import { NavbarAccountDropdown } from 'client/modules/app/navBar/components/NavbarAccountDropdown';
import { NavBarActionButtons } from 'client/modules/app/navBar/components/NavBarActionButtons';
import { useAppNavItems } from 'client/modules/app/navBar/hooks/useAppNavItems';
import { useGetIsActiveRoute } from 'client/modules/app/navBar/hooks/useGetIsActiveRoute';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function DesktopNavBarContent() {
  const { t } = useTranslation();
  const { show } = useDialog();
  const getIsActiveRoute = useGetIsActiveRoute();
  const isConnected = useIsConnected();
  const appNavItems = useAppNavItems();

  const navButtons = appNavItems.map((navItem) => {
    if (navItem.type === 'link') {
      return (
        <NavigationMenu.Item key={navItem.id}>
          <NavigationMenu.Link asChild>
            <AppNavItemButton
              as={Link}
              disabled={navItem.disabled}
              href={navItem.href}
              active={getIsActiveRoute(navItem.basePath)}
            >
              {navItem.label}
            </AppNavItemButton>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      );
    } else {
      const { Desktop } = navItem.content;
      return <Desktop key={navItem.id} />;
    }
  });

  const accountContent = (() => {
    if (!isConnected) {
      return (
        <PrimaryButton
          onClick={() => show({ type: 'connect', params: {} })}
          // This needs a bit more spacing to the right than the account popover
          className="mr-1.5"
          dataTestId="navbar-connect-wallet-button"
        >
          {t(($) => $.buttons.connectWallet)}
        </PrimaryButton>
      );
    }

    return <NavbarAccountDropdown />;
  })();

  return (
    <div className="h-navbar flex w-full items-center justify-between gap-x-3 pr-3 pl-6">
      <div className="flex items-center">
        <div className="pr-4">
          <AppNavLogoLink showIcon={false} />
        </div>
        <NavigationMenu.Root delayDuration={100}>
          <NavigationMenu.List className="flex items-center text-sm">
            {navButtons}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
      <div className="flex h-10 gap-x-0.5">
        <div className="flex items-center gap-x-4">
          {isConnected && (
            <PrimaryButton
              size="sm"
              onClick={() =>
                show({
                  type: 'deposit_options',
                  params: {},
                })
              }
            >
              {t(($) => $.buttons.deposit)}
            </PrimaryButton>
          )}
          {accountContent}
        </div>
        <NavBarActionButtons showDesktopActionButtons />
      </div>
    </div>
  );
}
