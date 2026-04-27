import { useEffect, useState } from 'react';

import type { MobileChartAPI } from '@nadohq/react-client';

export function useMobileChartAPI(initialProductId: number) {
  const [productId, setProductId] = useState<number>(initialProductId);

  // Expose API to window for React Native WebView
  useEffect(() => {
    const api: MobileChartAPI = {
      setProductId: (newProductId: number) => {
        setProductId(newProductId);
      },
    };

    window.mobileChartAPI = api;

    return () => {
      delete window.mobileChartAPI;
    };
  }, []);

  return { productId };
}
