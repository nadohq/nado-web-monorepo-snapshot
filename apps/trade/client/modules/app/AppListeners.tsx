'use client';

import { GatedAppAccessListener } from 'client/modules/app/gatedAppAccess/GatedAppAccessListener';
import { SubaccountWebSocketEventListener } from 'client/modules/app/queryRefetchListener/SubaccountWebSocketEventListener';
import { OpenCommandCenterOnKeyPressListener } from 'client/modules/commandCenter/components/OpenCommandCenterOnKeyPressListener';
import { ReferralCodeListener } from 'client/modules/referrals/ReferralCodeListener';
import { SentryConfigManager } from 'client/modules/sentry/SentryConfigManager';
import { TpSlPositionChangeListener } from 'client/modules/trading/tpsl/components/TpSlPositionChangeListener';
import { UtmQueryParamsListener } from 'client/modules/utm/UtmQueryParamsListener';

export function AppListeners() {
  return (
    <>
      <GatedAppAccessListener />
      <SubaccountWebSocketEventListener />
      <SentryConfigManager />
      <TpSlPositionChangeListener />
      <UtmQueryParamsListener />
      <ReferralCodeListener />
      <OpenCommandCenterOnKeyPressListener />
    </>
  );
}
