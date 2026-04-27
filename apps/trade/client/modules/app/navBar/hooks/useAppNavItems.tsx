import { WithClassnames } from '@nadohq/web-common';
import { ROUTES } from 'client/modules/app/consts/routes';
import { DesktopMoreLinksPopover } from 'client/modules/app/navBar/moreLinks/DesktopMoreLinksPopover';
import { MobileMoreLinksCollapsible } from 'client/modules/app/navBar/moreLinks/MobileMoreLinksCollapsible';
import { ComponentType, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface BaseAppNavItem {
  id: string;
}

interface AppNavLinkItem extends BaseAppNavItem {
  type: 'link';
  href: string;
  /**
   * Used in conjunction with `pathname` to conditionally identify a selected route.
   * see https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes for more info
   * for implementation of logic, see useGetIsActiveRoute
   */
  basePath: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface AppNavCustomItem extends BaseAppNavItem {
  type: 'custom';
  content: {
    Desktop: ComponentType;
    Mobile: ComponentType<WithClassnames>;
  };
}

type AppNavItem = AppNavLinkItem | AppNavCustomItem;

export function useAppNavItems() {
  const { t } = useTranslation();

  return useMemo(
    (): AppNavItem[] => [
      {
        id: 'perpetuals',
        type: 'link',
        href: ROUTES.perpTrading,
        label: t(($) => $.pageTitles.perpetuals),
        basePath: ROUTES.perpTrading,
      },
      {
        id: 'spot',
        type: 'link',
        href: ROUTES.spotTrading,
        label: t(($) => $.pageTitles.spot),
        basePath: ROUTES.spotTrading,
      },
      {
        id: 'portfolio',
        type: 'link',
        href: ROUTES.portfolio.overview,
        label: t(($) => $.pageTitles.portfolio),
        basePath: ROUTES.portfolio.base,
      },
      {
        id: 'vault',
        type: 'link',
        href: ROUTES.vault,
        label: t(($) => $.navigation.vault),
        basePath: ROUTES.vault,
      },
      {
        id: 'points',
        type: 'link',
        href: ROUTES.points,
        label: t(($) => $.pageTitles.points),
        basePath: ROUTES.points,
      },
      {
        id: 'referrals',
        type: 'link',
        href: ROUTES.referrals,
        label: t(($) => $.pageTitles.referrals),
        basePath: ROUTES.referrals,
      },
      {
        id: 'more',
        type: 'custom',
        content: {
          Desktop: DesktopMoreLinksPopover,
          Mobile: MobileMoreLinksCollapsible,
        },
      },
    ],
    [t],
  );
}
