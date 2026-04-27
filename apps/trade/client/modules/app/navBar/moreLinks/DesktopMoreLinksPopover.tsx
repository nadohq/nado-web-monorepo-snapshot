import { Divider, NavCardButton } from '@nadohq/web-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { AppNavItemButton } from 'client/modules/app/navBar/components/AppNavItemButton';
import { DesktopNavCustomPopover } from 'client/modules/app/navBar/components/DesktopNavCustomPopover';
import { MoreIconLinks } from 'client/modules/app/navBar/moreLinks/MoreIconLinks';
import { useMoreLinks } from 'client/modules/app/navBar/moreLinks/useMoreLinks';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function DesktopMoreLinksPopover() {
  const { t } = useTranslation();
  const { moreLinks, moreIconLinks } = useMoreLinks();

  return (
    <DesktopNavCustomPopover
      triggerContent={
        <AppNavItemButton withCaret>{t(($) => $.more)}</AppNavItemButton>
      }
      popoverClassName="w-80"
      popoverContent={
        <div className="flex flex-col gap-y-2">
          {moreLinks.map(({ label, href, icon, external, description }) => {
            return (
              <NavigationMenu.Link key={label} asChild>
                <NavCardButton
                  as={Link}
                  href={href}
                  external={external}
                  icon={icon}
                  iconClassName="h-5 w-auto"
                  title={label}
                  description={description}
                />
              </NavigationMenu.Link>
            );
          })}
          <Divider />
          <MoreIconLinks moreIconLinks={moreIconLinks} />
        </div>
      }
    />
  );
}
