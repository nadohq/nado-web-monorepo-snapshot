'use client';

import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { OpenAppStage } from 'client/modules/app/dialogs/GenerateDesktopWalletLinkQRCodeDialog/OpenAppStage';
import { ScanLoginQRCodeStage } from 'client/modules/app/dialogs/GenerateDesktopWalletLinkQRCodeDialog/ScanLoginQRCodeStage';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type GenerateWalletLinkQRCodeError =
  | 'requires_approve_sign_once'
  | 'requires_single_signature_session'
  | 'requires_save_private_key';

export function GenerateDesktopWalletLinkQRCodeDialog() {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const [stage, setStage] = useState<'open_app' | 'scan_login_qr'>('open_app');

  const stageContent = (() => {
    switch (stage) {
      case 'open_app':
        return <OpenAppStage onNext={() => setStage('scan_login_qr')} />;
      case 'scan_login_qr':
        return <ScanLoginQRCodeStage />;
    }
  })();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.desktopWalletLink)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>{stageContent}</BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
