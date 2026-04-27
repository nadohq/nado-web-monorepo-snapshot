import { WithChildren } from '@nadohq/web-common';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import {
  AnalyticsContext,
  AnalyticsContextData,
} from 'client/modules/analytics/AnalyticsContext';
import { AnalyticsGlobalEventsReporter } from 'client/modules/analytics/AnalyticsGlobalEventsReporter';
import { MicrosoftClarityAnalytics } from 'client/modules/analytics/components/MicrosoftClarityAnalytics';
import { AnalyticsEvent } from 'client/modules/analytics/types';
import { useCookiePreference } from 'client/modules/analytics/useCookiePreference';
import { clientEnv } from 'common/environment/clientEnv';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import { useCallback, useMemo } from 'react';

export function AnalyticsContextProvider({ children }: WithChildren) {
  const { areCookiesAccepted } = useCookiePreference();
  const { isTestnetDataEnv } = clientEnv;

  // Supported on all mainnet and when cookies are enabled
  const disabled = isTestnetDataEnv || !areCookiesAccepted;

  const updateUserAddress = useCallback<
    AnalyticsContextData['updateUserAddress']
  >(
    async (_address: string) => {
      if (disabled) {
        return;
      }

      // Send user address to analytics provider(s)
      // There is none for now
    },
    [disabled],
  );

  const trackEvent = useCallback<AnalyticsContextData['trackEvent']>(
    (_event: AnalyticsEvent) => {
      if (disabled) {
        return;
      }

      // Send event to analytics provider(s)
      // There is none for now
    },
    [disabled],
  );

  const value: AnalyticsContextData = useMemo(() => {
    return {
      updateUserAddress,
      trackEvent,
      areCookiesAccepted,
    };
  }, [updateUserAddress, trackEvent, areCookiesAccepted]);

  return (
    <AnalyticsContext value={value}>
      <AnalyticsGlobalEventsReporter />
      {children}
      <ExternalAnalyticsProviders areCookiesAccepted={areCookiesAccepted} />
    </AnalyticsContext>
  );
}

function ExternalAnalyticsProviders({
  areCookiesAccepted,
}: {
  areCookiesAccepted: boolean | null;
}) {
  if (!areCookiesAccepted) {
    return null;
  }

  return (
    <>
      <GoogleAnalytics gaId={SENSITIVE_DATA.googleAnalyticsId} />
      <GoogleTagManager gtmId={SENSITIVE_DATA.googleTagManagerId} />
      <MicrosoftClarityAnalytics areCookiesAccepted={areCookiesAccepted} />
    </>
  );
}
