import { useRequiredContext } from '@nadohq/react-client';
import { AnalyticsEvent } from 'client/modules/analytics/types';
import { createContext } from 'react';

export interface AnalyticsContextData {
  areCookiesAccepted: boolean | null;

  updateUserAddress(address: string): Promise<void>;

  trackEvent(event: AnalyticsEvent): void;
}

export const AnalyticsContext = createContext<AnalyticsContextData | null>(
  null,
);

// Hook to consume context
export const useAnalyticsContext = () => useRequiredContext(AnalyticsContext);
