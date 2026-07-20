'use client';

import { ChainEnv } from '@nadohq/client';
import {
  getPrimaryChain,
  getPrimaryChainEnvOrDefault,
  getWagmiConfig,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { useIsMobile } from '@nadohq/web-ui';
import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi';
import { useMultiWagmi } from 'client/context/wagmi/useMultiWagmi';
import { getPrivyWagmiConfig } from 'client/context/wagmi/utils/getPrivyWagmiConfig';
import { getWagmiConfigParams } from 'client/modules/app/appData/getWagmiConfigParams';
import {
  SUPPORTED_CHAIN_ENVS,
  SUPPORTED_CHAINS,
} from 'client/modules/app/appData/supportedChains';
import { ROUTES } from 'client/modules/app/consts/routes';
import { clientEnv } from 'common/environment/clientEnv';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WagmiProvider as VanillaWagmiProvider } from 'wagmi';

// Create configs as top-level consts to guarantee they are singletons as expected by Wagmi
const wagmiConfigParams = getWagmiConfigParams();
const vanillaWagmiConfig = getWagmiConfig(wagmiConfigParams);
const privyWagmiConfig = getPrivyWagmiConfig(wagmiConfigParams);

interface Props extends WithChildren {
  primaryChainEnv: ChainEnv | undefined;
}

/**
 * MultiWagmiProvider allows switching between multiple Wagmi providers (e.g. Privy and vanilla Wagmi) at runtime.
 *
 * This is to support both Privy embedded wallets (requiring Privy's WagmiProvider) _and_ custom connectors
 * (as Privy's WagmiProvider does not support custom connectors).
 *
 * The active WagmiProvider can be switched by calling `switchWagmiProvider` from `useMultiWagmi` hook, which will
 * cause the provider to re-render with the new active Wagmi provider.
 * It is fine as switching isn't frequent and connection reset will cause child components to re-render anyway.
 *
 * @param config - The Wagmi configuration
 * @returns
 */
export function MultiWagmiProvider({
  primaryChainEnv: basePrimaryChainEnv,
  children,
}: Props) {
  const primaryChainEnv = getPrimaryChainEnvOrDefault({
    primaryChainEnv: basePrimaryChainEnv,
    supportedChainEnvs: SUPPORTED_CHAIN_ENVS,
  });
  const { activeWagmiProvider } = useMultiWagmi();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const { WagmiProvider, wagmiConfig } = useMemo(() => {
    switch (activeWagmiProvider) {
      case 'wagmi':
        return {
          WagmiProvider: VanillaWagmiProvider,
          wagmiConfig: vanillaWagmiConfig,
        };
      case 'privy':
      default:
        return {
          WagmiProvider: PrivyWagmiProvider,
          wagmiConfig: privyWagmiConfig,
        };
    }
  }, [activeWagmiProvider]);

  const { isTestnetDataEnv } = clientEnv;
  const { appId, clientId } = isTestnetDataEnv
    ? SENSITIVE_DATA.privy.testnet
    : SENSITIVE_DATA.privy.prod;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const privyProviderConfig = useMemo((): PrivyClientConfig => {
    /*
    on mobile, the loginMethodsAndOrder UX is broken as there is no search box to find wallet in the huge walletconnect list
    so we prioritize email then have the `wallet` alternate screen with search box _and_ popular wallets first.

    on desktop, the loginMethodsAndOrder UX is fine as walletconnect_qr just shows a QR code instead of a huge list
    */
    const loginMethods: Partial<PrivyClientConfig> = isMobile
      ? { loginMethods: ['email', 'wallet'] }
      : {
          loginMethodsAndOrder: {
            primary: ['email', 'metamask', 'wallet_connect_qr'],
            overflow: ['detected_ethereum_wallets', 'kraken_wallet'],
          },
        };

    return {
      defaultChain: getPrimaryChain(primaryChainEnv),
      supportedChains: [...SUPPORTED_CHAINS],
      ...loginMethods,
      appearance: {
        showWalletLoginFirst: false,
        theme: 'dark',
        landingHeader: t(($) => $.signInToTrade),
        walletChainType: 'ethereum-only',
        walletList: [
          'detected_ethereum_wallets',
          'metamask',
          'kraken_wallet',
          'rainbow',
          'phantom',
          'wallet_connect',
        ],
      },
      embeddedWallets: {
        ethereum: {
          createOnLogin: 'users-without-wallets',
        },
        showWalletUIs: false,
      },
      // For OAuth logins (Google, X, ... ), having query params in URL (such as our ?market=) is problematic as OAuth flow involves
      // redirection which may lose the query params and thus force another redirect (eg. /perpetuals -> /perpetuals?market=BTC)
      // causing races with PrivyProvider resulting in broken login flow.
      // On top of this, in production builds the Next App Router automatically adds `_rsc=` temporary query params for prefetching,
      // introducing another racy OAuth failure mode (the unexpected presence of `_rsc` param fails OAuth URL validation).
      //
      // Setting a custom redirect URL to a queryparam-less URL is a safe workaround for now.
      customOAuthRedirectUrl: `${origin}${ROUTES.markets}`,
    };
  }, [primaryChainEnv, isMobile, origin, t]);

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={privyProviderConfig}
    >
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </PrivyProvider>
  );
}
