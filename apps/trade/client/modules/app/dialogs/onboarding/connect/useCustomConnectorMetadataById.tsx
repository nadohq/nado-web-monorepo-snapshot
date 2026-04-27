import { KNOWN_CONNECTOR_IDS, KnownConnectorID } from '@nadohq/react-client';
import { Icons } from '@nadohq/web-ui';

import walletconnectIcon from 'client/modules/app/dialogs/onboarding/connect/assets/walletconnect.svg';
import { WALLET_BUTTON_ICON_SIZE_CLASSNAME } from 'client/modules/app/dialogs/onboarding/connect/WalletButton';
import Image from 'next/image';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface ConnectorMetadata {
  icon: ReactNode | undefined;
  name: string;
}

/**
 * Metadata overrides by connector ID. There is unfortunately no strict typing for this: https://github.com/wevm/wagmi/discussions/3399#discussioncomment-8055819
 */
export function useCustomConnectorMetadataById() {
  const { t } = useTranslation();

  return useMemo((): Partial<Record<KnownConnectorID, ConnectorMetadata>> => {
    return {
      [KNOWN_CONNECTOR_IDS.injected]: {
        icon: (
          <Icons.WalletFill className={WALLET_BUTTON_ICON_SIZE_CLASSNAME} />
        ),
        name: t(($) => $.browserExtension),
      },
      [KNOWN_CONNECTOR_IDS.walletConnect]: {
        icon: (
          <Image
            src={walletconnectIcon}
            alt={t(($) => $.walletConnect)}
            className={WALLET_BUTTON_ICON_SIZE_CLASSNAME}
          />
        ),
        name: t(($) => $.walletConnect),
      },
      [KNOWN_CONNECTOR_IDS.desktopWalletLink]: {
        icon: <Icons.Devices className={WALLET_BUTTON_ICON_SIZE_CLASSNAME} />,
        name: t(($) => $.desktopWalletLink),
      },
    };
  }, [t]);
}
