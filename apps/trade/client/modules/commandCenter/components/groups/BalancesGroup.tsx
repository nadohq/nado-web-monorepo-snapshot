import { Group } from 'client/modules/commandCenter/components/groups/Group';
import { BalancesTable } from 'client/modules/commandCenter/components/tables/BalancesTable';
import { BalanceTableItem } from 'client/modules/commandCenter/hooks/useCommandCenterBalanceItems';
import { useTranslation } from 'react-i18next';

interface Props {
  items: BalanceTableItem[];
  shouldShow: boolean;
}

export function BalancesGroup({ items, shouldShow }: Props) {
  const { t } = useTranslation();

  return (
    <Group heading={t(($) => $.balances)} shouldShow={shouldShow}>
      <BalancesTable balances={items} />
    </Group>
  );
}
