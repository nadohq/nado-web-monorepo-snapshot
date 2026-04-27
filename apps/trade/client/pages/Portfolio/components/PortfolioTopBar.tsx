'use client';

import { useSizeClass } from '@nadohq/web-ui';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { DesktopCollateralButtons } from 'client/pages/Portfolio/components/DesktopCollateralButtons';
import { MobileCollateralButtons } from 'client/pages/Portfolio/components/MobileCollateralButtons';
import { PortfolioTopBarSubaccountSwitcher } from 'client/pages/Portfolio/components/PortfolioTopBarSubaccountSwitcher';

export function PortfolioTopBar() {
  const isConnected = useIsConnected();
  const { isMobile } = useSizeClass();

  const CollateralButtons = isMobile
    ? MobileCollateralButtons
    : DesktopCollateralButtons;

  return (
    <div className="flex items-center justify-between gap-2">
      <PortfolioTopBarSubaccountSwitcher
        className="sm:w-48"
        disabled={!isConnected}
      />
      <CollateralButtons disabled={!isConnected} />
    </div>
  );
}
