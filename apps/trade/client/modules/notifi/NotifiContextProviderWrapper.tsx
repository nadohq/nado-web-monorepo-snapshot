import {
  QueryDisabledError,
  useEVMContext,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { nonNullFilter, WithChildren } from '@nadohq/web-common';
import {
  EvmBlockchain,
  InputObject,
} from '@notifi-network/notifi-frontend-client';
import { NotifiContextProvider } from '@notifi-network/notifi-react';
import { useQuery } from '@tanstack/react-query';
import { useAllMarkets } from 'client/hooks/markets/useAllMarkets';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import { useMemo } from 'react';
import { toBytes } from 'viem';

interface NotifiConfig {
  env: 'Production' | 'Development';
  cardId: string;
  blockchainType: EvmBlockchain;
}

export function NotifiContextProviderWrapper({ children }: WithChildren) {
  const {
    connectionStatus: { connector, address, walletClient },
    primaryChainEnv,
  } = useEVMContext();
  const nadoClient = usePrimaryChainNadoClient();

  const { data: allMarketsData } = useAllMarkets();

  // Query tickers to construct price pair alerts. Notifi backend uses the same query to
  // construct price pair IDs
  const { data: tickersData } = useQuery({
    queryKey: ['tickers'],
    queryFn: async () => {
      if (!nadoClient) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.indexerClient.getV2Tickers({});
    },
    enabled: !!nadoClient,
  });

  const notifiConfig = ((): NotifiConfig | undefined => {
    switch (primaryChainEnv) {
      case 'inkMainnet':
        return {
          env: 'Production',
          cardId: SENSITIVE_DATA.notifi.cardId.inkProd,
          blockchainType: 'INK',
        };
      case 'inkTestnet':
        return {
          env: 'Production',
          cardId: SENSITIVE_DATA.notifi.cardId.inkTestnet,
          blockchainType: 'INK',
        };
      default:
        return;
    }
  })();

  const pricePairInputs: InputObject[] = useMemo(() => {
    if (!tickersData || !notifiConfig || !allMarketsData) {
      return [];
    }
    const blockchainType = notifiConfig.blockchainType;

    return Object.values(tickersData)
      .map((ticker) => {
        const market = allMarketsData.allMarkets[ticker.productId];

        if (!market || market.isHidden) {
          return;
        }

        return {
          label: market.metadata.marketName,
          value: `${ticker.tickerId}_${blockchainType}`,
        };
      })
      .filter(nonNullFilter);
  }, [allMarketsData, notifiConfig, tickersData]);

  const signMessage = async (message: Uint8Array) => {
    if (!walletClient) {
      throw Error('[NotifiContextProviderWrapper] Wallet not connected');
    }
    const result = await walletClient.signMessage({
      message: { raw: message },
    });
    return toBytes(result);
  };

  if (!address || !walletClient || !notifiConfig || !connector) {
    return null;
  }

  return (
    <NotifiContextProvider
      tenantId={SENSITIVE_DATA.notifi.tenantId}
      env={notifiConfig.env}
      cardId={notifiConfig.cardId}
      walletBlockchain={notifiConfig.blockchainType}
      walletPublicKey={address}
      signMessage={signMessage}
      inputs={{
        pricePairs: pricePairInputs,
        walletAddress: [{ label: '', value: address }],
      }}
    >
      {children}
    </NotifiContextProvider>
  );
}
