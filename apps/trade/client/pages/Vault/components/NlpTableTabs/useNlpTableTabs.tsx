import { NlpBalancesTable } from 'client/modules/nlp/tables/NlpBalancesTable';
import { NlpOpenEngineOrdersTable } from 'client/modules/nlp/tables/NlpOpenEngineOrdersTable';
import { NlpPositionsTable } from 'client/modules/nlp/tables/NlpPositionsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface NlpTableTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function useNlpTableTabs() {
  const { t } = useTranslation();

  return useMemo(
    (): NlpTableTab[] => [
      {
        id: 'balances',
        label: t(($) => $.balances),
        content: <NlpBalancesTable />,
      },
      {
        id: 'positions',
        label: t(($) => $.positions),
        content: <NlpPositionsTable />,
      },
      {
        id: 'open_orders',
        label: t(($) => $.openOrders),
        content: <NlpOpenEngineOrdersTable />,
      },
    ],
    [t],
  );
}
