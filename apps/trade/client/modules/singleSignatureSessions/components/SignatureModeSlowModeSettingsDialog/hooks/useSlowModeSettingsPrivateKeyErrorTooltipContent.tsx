import { SignatureModeSlowModeSettingsFormErrorType } from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/hooks/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useSlowModeSettingsPrivateKeyErrorTooltipContent({
  error,
}: {
  error: SignatureModeSlowModeSettingsFormErrorType | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (error) {
      case 'invalid_private_key':
        return t(($) => $.errors.invalidPrivateKeyFormat);
      default:
        return null;
    }
  }, [error, t]);
}
