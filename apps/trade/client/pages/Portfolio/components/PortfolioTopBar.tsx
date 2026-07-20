'use client';

import { useSizeClass } from '@nadohq/web-ui';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { DesktopCollateralButtons } from 'client/pages/Portfolio/components/DesktopCollateralButtons';
import { MobileCollateralButtons } from 'client/pages/Portfolio/components/MobileCollateralButtons';
import { PortfolioPrivacyModeButton } from 'client/pages/Portfolio/components/PortfolioPrivacyModeButton';
import { PortfolioTopBarSubaccountSwitcher } from 'client/pages/Portfolio/components/PortfolioTopBarSubaccountSwitcher';

export function PortfolioTopBar() {
  const isConnected = useIsConnected();
  const { isMobile } = useSizeClass();

  const CollateralButtons = isMobile
    ? MobileCollateralButtons
    : DesktopCollateralButtons;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-x-1">
        <PortfolioTopBarSubaccountSwitcher
          className="sm:w-48"
          disabled={!isConnected}
        />
        <PortfolioPrivacyModeButton disabled={!isConnected} />
      </div>
      <CollateralButtons disabled={!isConnected} />
    </div>
  );
}
