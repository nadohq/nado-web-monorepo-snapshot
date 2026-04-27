import { joinClassNames } from '@nadohq/web-common';
import { Icons, TextButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { SETTINGS_ROW_HEIGHT } from 'client/modules/settings/consts';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { useTranslation } from 'react-i18next';

export function OneClickTradingSetting() {
  const { t } = useTranslation();
  const { push } = useDialog();
  const isSingleSignatureSession = useIsSingleSignatureSession();

  return (
    <TextButton
      colorVariant="secondary"
      className={joinClassNames(SETTINGS_ROW_HEIGHT, 'text-sm')}
      onClick={() => {
        push({
          type: 'signature_mode_settings',
          params: {},
        });
      }}
      endIcon={<Icons.CaretRight size={16} />}
    >
      <span className="text-text-tertiary mr-auto">
        {t(($) => $.oneClickTrading)}
      </span>
      <span className="uppercase">
        {isSingleSignatureSession ? t(($) => $.on) : t(($) => $.off)}
      </span>
    </TextButton>
  );
}
