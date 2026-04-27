import { MobileSpotBalancesTab } from 'client/modules/tables/spotBalances/MobileSpotBalancesTab';
import { SpotBalancesTable } from 'client/modules/tables/spotBalances/SpotBalancesTable';

interface Props {
  isMobile?: boolean;
  hideSmallBalances?: boolean;
}

export function SpotBalancesTableTabContent({
  isMobile,
  hideSmallBalances,
}: Props) {
  if (isMobile) {
    return <MobileSpotBalancesTab hideSmallBalances={hideSmallBalances} />;
  }
  return <SpotBalancesTable hideSmallBalances={hideSmallBalances} />;
}
