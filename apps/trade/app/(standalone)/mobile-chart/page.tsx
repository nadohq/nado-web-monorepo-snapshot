'use client';

import { useSearchParams } from 'next/navigation';

import { MobileTradingViewChart } from 'client/modules/trading/mobileChart/components/MobileTradingViewChart';
import { useMobileChartAPI } from 'client/modules/trading/mobileChart/hooks/useMobileChartAPI';

// We should always load this with ?productId=x
const FALLBACK_PRODUCT_ID = 1;

export default function MobileChartPage() {
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('productId');
  const initialProductId = productIdParam
    ? Number(productIdParam)
    : FALLBACK_PRODUCT_ID;
  const { productId } = useMobileChartAPI(initialProductId);

  return <MobileTradingViewChart productId={productId} />;
}
