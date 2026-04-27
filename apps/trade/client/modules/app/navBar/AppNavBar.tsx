'use client';

import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { useIsDesktop } from '@nadohq/web-ui';
import { DesktopNavBarContent } from 'client/modules/app/navBar/DesktopNavBarContent';
import { MobileNavBarContent } from 'client/modules/app/navBar/MobileNavBarContent';

export function AppNavBar({ className }: WithClassnames) {
  const isDesktop = useIsDesktop();

  return (
    <div className={joinClassNames('bg-surface-card', className)}>
      {isDesktop ? <DesktopNavBarContent /> : <MobileNavBarContent />}
    </div>
  );
}
