import Clarity from '@microsoft/clarity';
import { clientEnv } from 'common/environment/clientEnv';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import { useEffect } from 'react';

export function MicrosoftClarityAnalytics({
  areCookiesAccepted,
}: {
  areCookiesAccepted: boolean | null;
}) {
  const disabled = clientEnv.isTestnetDataEnv;

  const isInitialized = typeof window.clarity !== 'undefined';

  // If not disabled and not initialized, initialize Clarity
  useEffect(() => {
    if (disabled || isInitialized) {
      return;
    }

    Clarity.init(SENSITIVE_DATA.microsoftClarityId);
  }, [disabled, isInitialized]);

  // Listen for changes in the cookie preference and update the consent if Clarity is initialized
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    Clarity.consent(areCookiesAccepted ?? false);
  }, [isInitialized, areCookiesAccepted]);

  return null;
}
