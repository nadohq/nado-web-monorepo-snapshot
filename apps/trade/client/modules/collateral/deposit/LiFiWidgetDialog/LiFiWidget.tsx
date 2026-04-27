'use client';

import { LiFiWidget as BaseLiFiWidget, WidgetSkeleton } from '@lifi/widget';
import { useLifiWidgetConfig } from 'client/modules/collateral/deposit/LiFiWidgetDialog/useLifiWidgetConfig';
import { Suspense } from 'react';
import { Address } from 'viem';

/**
 * This is exported as default to simplify lazy loading.
 * Consider loading this component lazily as @lifi/widget is a large dependency.
 */
export default function LiFiWidget({
  directDepositAddress,
}: {
  directDepositAddress: Address;
}) {
  const widgetConfig = useLifiWidgetConfig({
    depositAddress: directDepositAddress,
  });

  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <BaseLiFiWidget integrator="Nado" config={widgetConfig} />
    </Suspense>
  );
}
