import { PORTFOLIO_SUBROUTES, ROUTES } from 'client/modules/app/consts/routes';
import { clientEnv } from 'common/environment/clientEnv';
import { usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function usePortfolioNavItems() {
  const { t } = useTranslation();

  const pathname = usePathname();

  const getIsSelected = useCallback(
    (route: string) => {
      return pathname.toLowerCase() === route.toLowerCase();
    },
    [pathname],
  );

  return useMemo(
    () => [
      {
        label: t(($) => $.overview),
        href: PORTFOLIO_SUBROUTES.overview,
        selected: getIsSelected(ROUTES.portfolio.overview),
      },
      {
        label: t(($) => $.marginManager),
        href: PORTFOLIO_SUBROUTES.marginManager,
        selected: getIsSelected(ROUTES.portfolio.marginManager),
      },
      {
        label: t(($) => $.history),
        href: PORTFOLIO_SUBROUTES.history,
        selected: getIsSelected(ROUTES.portfolio.history),
      },
      ...(clientEnv.isTestnetDataEnv
        ? [
            {
              label: t(($) => $.faucet),
              href: PORTFOLIO_SUBROUTES.faucet,
              selected: getIsSelected(ROUTES.portfolio.faucet),
            },
          ]
        : []),
    ],
    [getIsSelected, t],
  );
}
