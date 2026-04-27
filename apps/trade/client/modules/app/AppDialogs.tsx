'use client';

import { ActionSuccessDialog } from 'client/modules/app/dialogs/ActionSuccessDialog';
import { CommandCenterDialog } from 'client/modules/app/dialogs/CommandCenterDialog';
import { AccountDialogs } from 'client/modules/app/dialogs/dialogGroups/AccountDialogs';
import { CampaignDialogs } from 'client/modules/app/dialogs/dialogGroups/CampaignDialogs';
import { CollateralDialogs } from 'client/modules/app/dialogs/dialogGroups/CollateralDialogs';
import { DetailDialogs } from 'client/modules/app/dialogs/dialogGroups/DetailDialogs';
import { NlpDialogs } from 'client/modules/app/dialogs/dialogGroups/NlpDialogs';
import { PointsDialogs } from 'client/modules/app/dialogs/dialogGroups/PointsDialogs';
import { TradingDialogs } from 'client/modules/app/dialogs/dialogGroups/TradingDialogs';
import { useAppDialogEffects } from 'client/modules/app/dialogs/hooks/useAppDialogEffects';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';

export function AppDialogs() {
  const { currentDialog } = useDialog();

  useAppDialogEffects();

  return (
    <>
      {currentDialog?.type === 'action_success' && (
        <ActionSuccessDialog {...currentDialog.params} />
      )}
      {currentDialog?.type === 'command_center' && <CommandCenterDialog />}
      <AccountDialogs />
      <TradingDialogs />
      <NlpDialogs />
      <CollateralDialogs />
      <DetailDialogs />
      <CampaignDialogs />
      <PointsDialogs />
    </>
  );
}
