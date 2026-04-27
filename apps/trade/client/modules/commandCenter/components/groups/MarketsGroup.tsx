import { Group } from 'client/modules/commandCenter/components/groups/Group';
import { MarketsTable } from 'client/modules/commandCenter/components/tables/MarketsTable';
import { MarketTableItem } from 'client/modules/commandCenter/hooks/useCommandCenterMarketItems';
import { useTranslation } from 'react-i18next';

interface Props {
  items: MarketTableItem[];
  shouldShow: boolean;
}

export function MarketsGroup({ items, shouldShow }: Props) {
  const { t } = useTranslation();

  return (
    <Group heading={t(($) => $.markets)} shouldShow={shouldShow}>
      <MarketsTable markets={items} />
    </Group>
  );
}
