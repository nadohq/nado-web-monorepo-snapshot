import { BigNumbers } from '@nadohq/client';
import { useEVMContext, useSubaccountContext } from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import {
  GoogleTagManager,
  sendGTMEvent as baseSendGTMEvent,
} from '@next/third-parties/google';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import {
  AnalyticsContext,
  AnalyticsContextData,
  useAnalyticsContext,
} from 'client/modules/analytics/AnalyticsContext';
import { GTMDataLayerEvent } from 'client/modules/analytics/types';
import { useCookiePreference } from 'client/modules/analytics/useCookiePreference';
import { clientEnv } from 'common/environment/clientEnv';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import i18n from 'common/i18n/i18n';
import { useCallback, useEffect, useMemo, useRef } from 'react';

function safeSendGTMEvent(event: GTMDataLayerEvent) {
  try {
    baseSendGTMEvent(event);
  } catch (ex) {
    console.error('Error sending GTM event', event.event, ex);
  }
}

export function AnalyticsContextProvider({ children }: WithChildren) {
  const {
    connectionStatus: { address: walletAddress },
  } = useEVMContext();
  const { currentSubaccount } = useSubaccountContext();
  const { areCookiesAccepted } = useCookiePreference();
  const { isTestnetDataEnv } = clientEnv;

  const googleTagManagerId = isTestnetDataEnv
    ? SENSITIVE_DATA.googleTagManagerId.testnet
    : SENSITIVE_DATA.googleTagManagerId.prod;

  const sendGTMEvent = useCallback<AnalyticsContextData['sendGTMEvent']>(
    (event: GTMDataLayerEvent) => {
      if (!areCookiesAccepted) {
        return;
      }

      safeSendGTMEvent(event);
    },
    [areCookiesAccepted],
  );

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    sendGTMEvent({
      event: 'set_walletAddress',
      walletAddress,
    });
  }, [walletAddress, sendGTMEvent]);

  useEffect(() => {
    sendGTMEvent({
      event: 'set_languageCode',
      languageCode: i18n.language,
    });
    // send initial selected language as data layer variable, track user-initiated changes as `language_changed` elsewhere.
  }, [sendGTMEvent]);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    sendGTMEvent({
      event: 'set_activeSubaccount',
      subaccountName: currentSubaccount.name,
    });
  }, [currentSubaccount.name, sendGTMEvent, walletAddress]);

  const value: AnalyticsContextData = useMemo(() => {
    return {
      sendGTMEvent,
      areCookiesAccepted,
    };
  }, [sendGTMEvent, areCookiesAccepted]);

  return (
    <AnalyticsContext value={value}>
      {children}
      {areCookiesAccepted && (
        <>
          <GoogleTagManager gtmId={googleTagManagerId} />
          {walletAddress && <PositionMetricsTracker />}
        </>
      )}
    </AnalyticsContext>
  );
}

function PositionMetricsTracker() {
  const { currentSubaccount } = useSubaccountContext();
  const { data: perpPositions, isLoading } = usePerpPositions();
  const { sendGTMEvent } = useAnalyticsContext();
  const lastSentSubaccountKey = useRef<string | null>(null);

  const { numPositions, openInterestUsd } = useMemo(() => {
    if (!perpPositions || isLoading) {
      return { numPositions: undefined, openInterestUsd: undefined };
    }
    return {
      numPositions: perpPositions.filter((p) => !p.amount.isZero()).length,
      openInterestUsd: perpPositions.reduce(
        (sum, p) => sum.plus(p.notionalValueUsd),
        BigNumbers.ZERO,
      ),
    };
  }, [perpPositions, isLoading]);

  const subaccountKey = `${currentSubaccount.name}-${currentSubaccount.address}`;

  useEffect(() => {
    if (
      isLoading ||
      openInterestUsd === undefined ||
      numPositions === undefined
    ) {
      return;
    }
    if (lastSentSubaccountKey.current === subaccountKey) {
      return;
    }

    sendGTMEvent({
      event: 'set_positionsMetrics',
      openInterestUsd: openInterestUsd.integerValue().toNumber(),
      numPositions,
    });

    lastSentSubaccountKey.current = subaccountKey;
  }, [isLoading, openInterestUsd, numPositions, subaccountKey, sendGTMEvent]);

  return null;
}
