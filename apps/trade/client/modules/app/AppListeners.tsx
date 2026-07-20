'use client';

import { GatedAppAccessListener } from 'client/modules/app/gatedAppAccess/GatedAppAccessListener';
import { StaleDataListener } from 'client/modules/app/staleData/StaleDataListener';
import { OpenCommandCenterOnKeyPressListener } from 'client/modules/commandCenter/components/OpenCommandCenterOnKeyPressListener';
import { ReferralCodeListener } from 'client/modules/referrals/ReferralCodeListener';
import { SentryConfigManager } from 'client/modules/sentry/SentryConfigManager';
import { TpSlPositionChangeListener } from 'client/modules/trading/tpsl/components/TpSlPositionChangeListener';
import { MarketPricesWebSocketListener } from 'client/modules/webSockets/listeners/MarketPricesWebSocketListener';
import { SubaccountWebSocketEventListener } from 'client/modules/webSockets/listeners/SubaccountWebSocketEventListener';

export function AppListeners() {
  return (
    <>
      <GatedAppAccessListener />
      <MarketPricesWebSocketListener />
      <SubaccountWebSocketEventListener />
      <StaleDataListener />
      <SentryConfigManager />
      <TpSlPositionChangeListener />
      <ReferralCodeListener />
      <OpenCommandCenterOnKeyPressListener />
    </>
  );
}
