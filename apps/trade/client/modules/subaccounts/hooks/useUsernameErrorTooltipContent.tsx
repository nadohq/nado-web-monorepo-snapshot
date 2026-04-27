import { ProfileErrorType } from '@nadohq/react-client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useUsernameErrorTooltipContent({
  formError,
}: {
  formError: ProfileErrorType | undefined;
}) {
  const { t } = useTranslation();

  return useMemo(() => {
    switch (formError) {
      case 'username_error':
        return t(($) => $.errors.usernamesMustBeLessThan24Characters);
      default:
        return null;
    }
  }, [formError, t]);
}
