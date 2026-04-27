import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Divider, Icons, PrimaryButton, TextButton } from '@nadohq/web-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { AppVersion } from 'client/modules/app/components/AppVersion';
import { LatencyMonitor } from 'client/modules/app/components/LatencyMonitor';
import { StatusButton } from 'client/modules/app/components/StatusButton';
import { UpcomingMaintenanceLink } from 'client/modules/app/components/UpcomingMaintenanceLink';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useAlertUpcomingMaintenanceWindow } from 'client/modules/app/hooks/useAlertUpcomingMaintenanceWindow';
import { AppNavItemButton } from 'client/modules/app/navBar/components/AppNavItemButton';
import { AppNavLogoLink } from 'client/modules/app/navBar/components/AppNavLogoLink';
import { NavbarAccountDropdown } from 'client/modules/app/navBar/components/NavbarAccountDropdown';
import { NavBarActionButtons } from 'client/modules/app/navBar/components/NavBarActionButtons';
import { useAppNavItems } from 'client/modules/app/navBar/hooks/useAppNavItems';
import { useGetIsActiveRoute } from 'client/modules/app/navBar/hooks/useGetIsActiveRoute';
import { openMobileNavAtom } from 'client/store/navigationStore';
import { LINKS } from 'common/brandMetadata/links';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function MobileNavBarContent() {
  const { t } = useTranslation();
  const { show } = useDialog();
  const [openMobileNav, setOpenMobileNav] = useAtom(openMobileNavAtom);

  const isConnected = useIsConnected();

  const NavDrawerIcon = openMobileNav ? Icons.X : Icons.List;

  const onWalletButtonClick = () => {
    setOpenMobileNav(false);
    show({
      type: 'connect',
      params: {},
    });
  };

  const accountContent = isConnected ? (
    <NavbarAccountDropdown />
  ) : (
    <PrimaryButton onClick={onWalletButtonClick}>
      {t(($) => $.buttons.connectWallet)}
    </PrimaryButton>
  );

  return (
    <Popover.Root open={openMobileNav} onOpenChange={setOpenMobileNav}>
      <div className="h-navbar flex items-center justify-between px-3">
        <div className="flex items-center gap-x-2">
          <Popover.Trigger asChild>
            {/*h-full is needed here such that the trigger fills the navbar height, allowing the popover content to align properly*/}
            <TextButton colorVariant="secondary" className="h-full p-2.5">
              <NavDrawerIcon size={20} />
            </TextButton>
          </Popover.Trigger>
          <AppNavLogoLink showIcon={true} />
        </div>
        <div className="flex h-8">
          {accountContent}
          <NavBarActionButtons showDesktopActionButtons={false} />
        </div>
      </div>
      <Popover.Content align="end">
        <MobileNavMenu />
      </Popover.Content>
    </Popover.Root>
  );
}

function MobileNavMenu({ className }: WithClassnames) {
  const { t } = useTranslation();
  const [, setOpenMobileNav] = useAtom(openMobileNavAtom);
  const getIsActiveRoute = useGetIsActiveRoute();
  const alertUpcomingMaintenanceWindow = useAlertUpcomingMaintenanceWindow();
  const appNavItems = useAppNavItems();
  const { show } = useDialog();

  return (
    <div
      className={joinClassNames(
        'bg-surface-card w-screen',
        'no-scrollbar flex flex-col justify-between overflow-y-auto',
        className,
      )}
      style={{
        height: 'var(--radix-popper-available-height)',
      }}
    >
      <NavigationMenu.Root orientation="vertical">
        <NavigationMenu.List className="flex flex-col gap-y-2 px-2 py-4">
          {appNavItems.map((navItem) => {
            if (navItem.type === 'link') {
              return (
                <NavigationMenu.Item key={navItem.id}>
                  <NavigationMenu.Link asChild>
                    <AppNavItemButton
                      as={Link}
                      active={getIsActiveRoute(navItem.basePath)}
                      key={navItem.id}
                      disabled={navItem.disabled}
                      href={navItem.href}
                      onClick={() => setOpenMobileNav(false)}
                    >
                      {navItem.label}
                    </AppNavItemButton>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              );
            } else if (navItem.type === 'custom') {
              const { Mobile } = navItem.content;
              return <Mobile key={navItem.id} />;
            }
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <div className="flex flex-col gap-y-2 p-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <StatusButton />
            <TextButton
              colorVariant="secondary"
              startIcon={<Icons.Question />}
              onClick={() => {
                setOpenMobileNav(false);
                show({ type: 'help_center', params: {} });
              }}
            >
              {t(($) => $.buttons.getHelp)}
            </TextButton>
            <TextButton
              colorVariant="secondary"
              startIcon={<Icons.HandWaving />}
              as={Link}
              href={LINKS.zendeskAlphaFeedback}
              onClick={() => setOpenMobileNav(false)}
              external
            >
              {t(($) => $.buttons.feedback)}
            </TextButton>
          </div>
          <div className="flex gap-x-2">
            <AppVersion />
            <LatencyMonitor />
          </div>
        </div>
        {alertUpcomingMaintenanceWindow && (
          <>
            <Divider />
            <UpcomingMaintenanceLink />
          </>
        )}
      </div>
    </div>
  );
}
