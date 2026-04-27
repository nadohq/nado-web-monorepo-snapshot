import { WithClassnames } from '@nadohq/web-common';
import { AppNavItemButton } from 'client/modules/app/navBar/components/AppNavItemButton';
import { MobileNavCustomCollapsible } from 'client/modules/app/navBar/components/MobileNavCustomCollapsible';
import { useMobileCollapsible } from 'client/modules/app/navBar/hooks/useMobileCollapsible';
import { MoreIconLinks } from 'client/modules/app/navBar/moreLinks/MoreIconLinks';
import { useMoreLinks } from 'client/modules/app/navBar/moreLinks/useMoreLinks';
import { useTranslation } from 'react-i18next';

export function MobileMoreLinksCollapsible({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { moreLinks, moreIconLinks } = useMoreLinks();
  const { onCollapsibleLinkClick } = useMobileCollapsible();

  return (
    <MobileNavCustomCollapsible.Root
      className={className}
      triggerContent={
        <AppNavItemButton withCaret>{t(($) => $.more)}</AppNavItemButton>
      }
      collapsibleContent={
        <MobileNavCustomCollapsible.LinksContainer>
          {moreLinks.map(({ label, href, external }) => {
            return (
              <MobileNavCustomCollapsible.LinkButton
                key={label}
                href={href}
                external={external}
                onClick={onCollapsibleLinkClick}
              >
                {label}
              </MobileNavCustomCollapsible.LinkButton>
            );
          })}
          <MoreIconLinks
            // Add a bit more spacing on mobile to avoid the links being too close.
            className="gap-x-5"
            moreIconLinks={moreIconLinks}
          />
        </MobileNavCustomCollapsible.LinksContainer>
      }
    />
  );
}
