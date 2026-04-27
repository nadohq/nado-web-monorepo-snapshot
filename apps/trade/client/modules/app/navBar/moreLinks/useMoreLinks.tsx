import { IconComponent, Icons } from '@nadohq/web-ui';
import { LINKS } from 'common/brandMetadata/links';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface MoreLink {
  label: string;
  icon: IconComponent;
  description: string;
  href: string;
  external: boolean;
}

export interface MoreIconLink extends Omit<MoreLink, 'description'> {}

/**
 * More links for the app nav bar. Shared between mobile and desktop more links.
 * Mobile is a Collapsible whereas Desktop is a Popover component.
 * @returns More links for the app nav bar
 */
export function useMoreLinks(): {
  moreLinks: MoreLink[];
  moreIconLinks: MoreIconLink[];
} {
  const { t } = useTranslation();
  const moreLinks = useMemo(
    () => [
      {
        label: t(($) => $.feedbackAndSupport),
        description: t(($) => $.feedbackAndSupportDescription),
        href: LINKS.zendeskAlphaFeedback,
        external: true,
        icon: Icons.HandWaving,
      },
      {
        label: t(($) => $.reportBugs),
        description: t(($) => $.reportBugsDescription),
        href: LINKS.hacken,
        external: true,
        icon: Icons.Files,
      },
      {
        label: t(($) => $.documentation),
        description: t(($) => $.documentationDescription),
        href: LINKS.docs,
        external: true,
        icon: Icons.Question,
      },
      {
        label: t(($) => $.statsDashboard),
        description: t(($) => $.statsDashboardDescription),
        href: LINKS.statsDashboard,
        external: true,
        icon: Icons.ChartBar,
      },
      {
        label: t(($) => $.termsOfUse),
        description: t(($) => $.termsOfUseDescription),
        href: LINKS.termsOfUse,
        external: true,
        icon: Icons.Files,
      },
    ],
    [t],
  );

  const moreIconLinks = useMemo(
    () => [
      {
        label: t(($) => $.website),
        href: LINKS.marketingSite,
        icon: Icons.GlobeSimple,
        external: true,
      },
      // {
      //   label: 'Discord',
      //   href: LINKS.discord,
      //   icon: Icons.DiscordLogo,
      //   external: true,
      // },
      {
        label: t(($) => $.buttons.xSocial),
        href: LINKS.x,
        external: true,
        icon: Icons.XLogo,
      },
    ],
    [t],
  );

  return {
    moreLinks,
    moreIconLinks,
  };
}
