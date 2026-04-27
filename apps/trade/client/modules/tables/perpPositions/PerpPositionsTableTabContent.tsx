import { MobilePerpPositionsTab } from 'client/modules/tables/perpPositions/MobilePerpPositionsTab';
import { PerpPositionsTable } from 'client/modules/tables/perpPositions/PerpPositionsTable';
import { TableTabProps } from 'client/modules/tables/tabs/types';

export function PerpPositionsTableTabContent({
  isMobile,
  productIds,
}: TableTabProps) {
  if (isMobile) {
    return <MobilePerpPositionsTab productIds={productIds} />;
  }
  return <PerpPositionsTable productIds={productIds} />;
}
