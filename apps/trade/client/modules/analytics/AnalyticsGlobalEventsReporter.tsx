import { useEVMContext } from '@nadohq/react-client';
import { useAnalyticsContext } from 'client/modules/analytics/AnalyticsContext';
import { useEffect } from 'react';

/**
 * Reports wallet connection and saved user settings to analytics:
 */
export function AnalyticsGlobalEventsReporter() {
  const {
    connectionStatus: { address },
  } = useEVMContext();
  const { updateUserAddress } = useAnalyticsContext();

  // Update user address
  useEffect(() => {
    if (address) {
      updateUserAddress(address);
    }
  }, [address, updateUserAddress]);

  return null;
}
