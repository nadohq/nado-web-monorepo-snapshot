import { useRequiredContext } from '@nadohq/react-client';
import type { GTMDataLayerEvent } from 'client/modules/analytics/types';
import { createContext } from 'react';

export interface AnalyticsContextData {
  areCookiesAccepted: boolean | null;

  sendGTMEvent(event: GTMDataLayerEvent): void;
}

export const AnalyticsContext = createContext<AnalyticsContextData | null>(
  null,
);

// Hook to consume context
export const useAnalyticsContext = () => useRequiredContext(AnalyticsContext);
