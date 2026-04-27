import { Group } from 'client/modules/commandCenter/components/groups/Group';
import { PositionsTable } from 'client/modules/commandCenter/components/tables/PositionsTable';
import { PositionsTableItem } from 'client/modules/commandCenter/hooks/useCommandCenterPositionItems';
import { useTranslation } from 'react-i18next';

interface Props {
  items: PositionsTableItem[];
  shouldShow: boolean;
}

export function PositionsGroup({ items, shouldShow }: Props) {
  const { t } = useTranslation();

  return (
    <Group heading={t(($) => $.yourPositions)} shouldShow={shouldShow}>
      <PositionsTable positions={items} />
    </Group>
  );
}
