import { IconComponent, Icons } from '@nadohq/web-ui';
import { ROUTES } from 'client/modules/app/consts/routes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface EarnLink {
  label: string;
  icon: IconComponent;
  description: string;
  href: string;
  external: boolean;
  /**
   * When enabled, calls out the link with a pulsing status indicator (and
   * lights up the dropdown trigger). Useful for highlighting a page that is
   * currently live, e.g. an active trading competition.
   */
  showLiveIndicator?: boolean;
}

/**
 * Earn links for the app nav bar. Shared between mobile and desktop earn links.
 * Mobile is a Collapsible whereas Desktop is a Popover component.
 * @returns Earn links for the app nav bar
 */
export function useEarnLinks(): {
  earnLinks: EarnLink[];
  hasLiveLink: boolean;
} {
  const { t } = useTranslation();
  const earnLinks = useMemo<EarnLink[]>(
    () => [
      {
        label: t(($) => $.pageTitles.tradingCompetition),
        description: t(($) => $.earn.tradingCompetitionDescription),
        href: ROUTES.tradingCompetition.base,
        external: false,
        icon: Icons.Trophy,
      },
      {
        label: t(($) => $.navigation.vault),
        description: t(($) => $.earn.vaultDescription),
        href: ROUTES.vault,
        external: false,
        icon: Icons.Vault,
      },
      {
        label: t(($) => $.pageTitles.referrals),
        description: t(($) => $.earn.referralsDescription),
        href: ROUTES.referrals,
        external: false,
        icon: Icons.Users,
      },
    ],
    [t],
  );

  const hasLiveLink = earnLinks.some(
    ({ showLiveIndicator }) => showLiveIndicator,
  );

  return {
    earnLinks,
    hasLiveLink,
  };
}
