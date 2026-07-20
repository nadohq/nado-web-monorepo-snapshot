import { NavCardButton } from '@nadohq/web-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { AppNavItemButton } from 'client/modules/app/navBar/components/AppNavItemButton';
import { DesktopNavCustomPopover } from 'client/modules/app/navBar/components/DesktopNavCustomPopover';
import { useEarnLinks } from 'client/modules/app/navBar/earnLinks/useEarnLinks';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function DesktopEarnLinksPopover() {
  const { t } = useTranslation();
  const { earnLinks, hasLiveLink } = useEarnLinks();

  return (
    <DesktopNavCustomPopover
      triggerContent={
        <AppNavItemButton withCaret showLiveIndicator={hasLiveLink}>
          {t(($) => $.earn.label)}
        </AppNavItemButton>
      }
      popoverClassName="w-80"
      popoverContent={
        <div className="flex flex-col gap-y-2">
          {earnLinks.map(
            ({
              label,
              href,
              icon,
              external,
              description,
              showLiveIndicator,
            }) => {
              return (
                <NavigationMenu.Link key={href} asChild>
                  <NavCardButton
                    as={Link}
                    href={href}
                    external={external}
                    icon={icon}
                    iconClassName="h-5 w-auto"
                    title={label}
                    description={description}
                    showLiveIndicator={showLiveIndicator}
                  />
                </NavigationMenu.Link>
              );
            },
          )}
        </div>
      }
    />
  );
}
