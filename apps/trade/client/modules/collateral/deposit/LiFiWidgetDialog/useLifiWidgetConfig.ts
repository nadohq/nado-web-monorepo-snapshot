import {
  BaseToken,
  ChainId,
  ChainType,
  useWidgetEvents,
  WidgetConfig,
  WidgetEvent,
} from '@lifi/widget';
import { useEVMContext } from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import {
  DEFAULT_LIFI_WIDGET_CONFIG,
  LIFI_CHAIN_ENV_TO_CHAIN_ID,
} from 'client/modules/collateral/deposit/LiFiWidgetDialog/config';
import { first } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, checksumAddress } from 'viem';

export function useLifiWidgetConfig({
  depositAddress,
}: {
  depositAddress: Address;
}): WidgetConfig {
  const { t } = useTranslation();
  const { primaryChainEnv, supportedChains } = useEVMContext();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const currentChainId = LIFI_CHAIN_ENV_TO_CHAIN_ID[primaryChainEnv];

  const supportedChainIds = useMemo(() => {
    return supportedChains.map((chain) => chain.id);
  }, [supportedChains]);

  // Map spot market tokens to tokens that can be used
  // This is to prevent unsupported tokens from being used in the widget
  const allowedToTokens = useMemo((): BaseToken[] => {
    if (!allMarketsStaticData) {
      return [];
    }

    return [
      allMarketsStaticData.primaryQuoteProduct,
      ...Object.values(allMarketsStaticData.spotMarkets),
    ].map((market) => {
      return {
        // Li.Fi widget expects checksummed addresses
        address: checksumAddress(market.metadata.token.address),
        chainId: currentChainId as ChainId,
      };
    });
  }, [allMarketsStaticData, currentChainId]);

  const widgetEvents = useWidgetEvents();
  useEffect(() => {
    // While this should NEVER happen, we want to throw an error (which causes a route fetch failure)
    // if an invalid token is selected. this guards against widget bugs where
    // a user could potentially send unsupported tokens, or bridge to unsupported chains
    // Note that there is a `DestinationChainTokenSelected` event, but this doesn't fire when the user swaps the to/from tokens
    widgetEvents.on(WidgetEvent.AvailableRoutes, (routes) => {
      // Safe to assume that all routes will have the same destination token
      const toToken = first(routes)?.toToken;
      if (!toToken) {
        return;
      }

      if (toToken.chainId !== currentChainId) {
        throw new Error(
          `[useLifiWidgetConfig] Invalid destination chain selected: ${toToken.chainId}, expected: ${currentChainId}`,
        );
      }
      if (
        allowedToTokens.length &&
        !allowedToTokens.find(
          (t) => t.address.toLowerCase() === toToken.address.toLowerCase(),
        )
      ) {
        throw new Error(
          `[useLifiWidgetConfig] Invalid destination token selected: ${toToken.address} on chain ${toToken.chainId}`,
        );
      }
    });

    return () => widgetEvents.all.clear();
  }, [allowedToTokens, currentChainId, widgetEvents]);

  return useMemo(() => {
    return {
      ...DEFAULT_LIFI_WIDGET_CONFIG,
      chains: {
        from: {
          allow: supportedChainIds,
        },
        to: {
          allow: [currentChainId],
        },
      },
      tokens: {
        to: {
          allow: allowedToTokens,
        },
      },
      toAddress: {
        address: depositAddress,
        chainType: ChainType.EVM,
        name: t(($) => $.nadoDepositAddress),
      },
    };
  }, [allowedToTokens, currentChainId, depositAddress, supportedChainIds, t]);
}
