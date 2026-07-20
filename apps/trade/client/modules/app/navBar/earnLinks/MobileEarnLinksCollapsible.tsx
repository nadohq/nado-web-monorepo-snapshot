import { WithClassnames } from '@nadohq/web-common';
import { AppNavItemButton } from 'client/modules/app/navBar/components/AppNavItemButton';
import { MobileNavCustomCollapsible } from 'client/modules/app/navBar/components/MobileNavCustomCollapsible';
import { useEarnLinks } from 'client/modules/app/navBar/earnLinks/useEarnLinks';
import { useMobileCollapsible } from 'client/modules/app/navBar/hooks/useMobileCollapsible';
import { useTranslation } from 'react-i18next';

export function MobileEarnLinksCollapsible({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { earnLinks, hasLiveLink } = useEarnLinks();
  const { onCollapsibleLinkClick } = useMobileCollapsible();

  return (
    <MobileNavCustomCollapsible.Root
      className={className}
      triggerContent={
        <AppNavItemButton withCaret showLiveIndicator={hasLiveLink}>
          {t(($) => $.earn.label)}
        </AppNavItemButton>
      }
      collapsibleContent={
        <MobileNavCustomCollapsible.LinksContainer>
          {earnLinks.map(({ label, href, external, showLiveIndicator }) => {
            return (
              <MobileNavCustomCollapsible.LinkButton
                key={href}
                href={href}
                external={external}
                showLiveIndicator={showLiveIndicator}
                onClick={onCollapsibleLinkClick}
              >
                {label}
              </MobileNavCustomCollapsible.LinkButton>
            );
          })}
        </MobileNavCustomCollapsible.LinksContainer>
      }
    />
  );
}
