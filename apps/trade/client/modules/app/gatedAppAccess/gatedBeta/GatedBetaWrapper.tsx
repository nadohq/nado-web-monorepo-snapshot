'use client';

import { WithChildren } from '@nadohq/web-common';
import { BetaWelcomeScreen } from 'client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/BetaWelcomeScreen';
import { useAddressGatedBetaState } from 'client/modules/app/gatedAppAccess/gatedBeta/useAddressGatedBetaState';

export function GatedBetaWrapper({ children }: WithChildren) {
  const gatedBetaState = useAddressGatedBetaState();

  switch (gatedBetaState) {
    case 'access_allowed':
      return <>{children}</>;
    case 'loading':
      // Render nothing when still loading the invitation status to prevent flicker
      return null;
    case 'access_denied':
      return <BetaWelcomeScreen />;
  }
}
