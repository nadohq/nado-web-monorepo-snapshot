import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { BrandLoadingWrapper } from 'client/components/BrandIconLoadingWrapper/BrandLoadingWrapper';
import { WIDGET_CONTAINER_ID } from 'client/modules/trading/chart/config/webWidgetConfig';
import { useMobileTradingViewChart } from 'client/modules/trading/mobileChart/hooks/useMobileTradingViewChart';

interface MobileTradingViewChartProps extends WithClassnames {
  productId: number;
}

export function MobileTradingViewChart({
  className,
  productId,
}: MobileTradingViewChartProps) {
  const { isReady, chartContainerRef } = useMobileTradingViewChart({
    productId,
  });

  return (
    <div className={joinClassNames('h-screen w-screen', className)}>
      <BrandLoadingWrapper
        isLoading={!isReady}
        indicatorContainerClassName="absolute inset-0"
        grayscale
      />
      <div
        id={WIDGET_CONTAINER_ID}
        ref={chartContainerRef}
        className={joinClassNames(
          'flex h-full w-full flex-1 delay-100',
          isReady ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </div>
  );
}
