'use client';

import '@funkit/connect/styles.css';

import type { FunkitConfig, Locale } from '@funkit/connect';
import { FunkitProvider } from '@funkit/connect';
import { WithChildren } from '@nadohq/web-common';
import { useSavedPrimaryChainEnv } from 'client/modules/app/appData/hooks/useSavedPrimaryChainEnv';
import { FUNKIT_THEME } from 'client/modules/collateral/funkit/funkitTheme';
import { IMAGES } from 'common/brandMetadata/images';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/** Mounts Fun's Checkout SDK provider with Nado's config + theme. */
export function FunkitAppProvider({ children }: WithChildren) {
  const { savedPrimaryChainEnv: primaryChainEnv } = useSavedPrimaryChainEnv();
  const { t, i18n } = useTranslation();

  const destinationLabel = t(($) => $.nadoAccount);
  const funkitConfig = useMemo<FunkitConfig>(
    () => ({
      appName: 'Nado',
      apiKey: SENSITIVE_DATA.funkitApiKey,
      uiCustomizations: {
        alignTitle: 'left',
        sourceChangeScreen: {
          showTargetAssetSelection: true,
        },
        transferCryptoScreen: {
          showYouSendYouReceive: true,
        },
        confirmationScreen: {
          destinationConfig: {
            icon: (
              <Image src={IMAGES.brandIcon} width={12} alt={destinationLabel} />
            ),
            text: destinationLabel,
            url: 'https://app.nado.xyz',
          },
        },
      },
    }),
    [destinationLabel],
  );

  // Use Fun's sandbox infra (quotes/relay) everywhere except Ink mainnet so we never hit Fun's
  // production env by accident. It's not a safe-to-test guard, though: the deposit always targets
  // real Ink mainnet, so completing a checkout will move real funds into the user's Nado account.
  const sandbox = primaryChainEnv !== 'inkMainnet';

  return (
    // Omit `wagmiConfig`/`queryClient`: Fun forks its own providers only when both are passed.
    // Leaving them out makes it reuse the ambient ones — so this must stay mounted inside Nado's
    // `MultiWagmiProvider`.
    <FunkitProvider
      funkitConfig={funkitConfig}
      theme={FUNKIT_THEME}
      modalSize="extraWide"
      sandbox={sandbox}
      locale={i18n.language as Locale}
    >
      {children}
    </FunkitProvider>
  );
}
