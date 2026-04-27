import { NLP_PRODUCT_ID, QUOTE_PRODUCT_ID } from '@nadohq/client';
import {
  KNOWN_PRODUCT_IDS,
  SpotProductMetadata,
  usePrimaryChainId,
} from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryDirectDepositAddress } from 'client/hooks/query/collateral/useQueryDirectDepositAddress';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import {
  CCTP_SOURCE_CHAIN_CONFIGS,
  CctpSourceChainId,
} from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import connectedWalletImg from 'client/modules/collateral/deposit/DepositOptionsDialog/assets/connected-wallet.jpg';
import externalWalletImg from 'client/modules/collateral/deposit/DepositOptionsDialog/assets/external-wallet.jpg';
import { DepositOptionCardButtonProps } from 'client/modules/collateral/deposit/DepositOptionsDialog/components/DepositOptionCardButton';
import { SOURCE_CHAINS } from 'client/modules/collateral/deposit/DepositOptionsDialog/consts';
import {
  DepositAssetOption,
  DepositChainOption,
  DepositOptionsDialogParams,
  DepositSourceChainConfig,
} from 'client/modules/collateral/deposit/DepositOptionsDialog/types';
import {
  USDT0_SOURCE_CHAIN_CONFIGS,
  Usdt0SourceChainId,
} from 'client/modules/collateral/deposit/Usdt0BridgeDialog/config';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useDepositOptionsDialog({
  initialProductId,
}: DepositOptionsDialogParams) {
  const { t } = useTranslation();
  const { push } = useDialog();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { data: directDepositAddress } = useQueryDirectDepositAddress();
  const primaryChainId = usePrimaryChainId();

  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >(initialProductId);

  // Always pre-select the primary chain so the product isn't immediately
  // cleared by the empty assetOptions guard below.
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(
    primaryChainId,
  );

  const selectedChainConfig = useMemo(
    () => SOURCE_CHAINS.find((c) => c.chain.id === selectedChainId),
    [selectedChainId],
  );

  const assetOptions = useMemo(() => {
    if (!allMarketsStaticData || !selectedChainConfig) return [];

    const spotProducts = Object.values(
      allMarketsStaticData.spotProducts,
    ).filter((product) => product.productId !== NLP_PRODUCT_ID);

    return spotProducts.map((product) =>
      toAssetOption(product.productId, product.metadata),
    );
  }, [allMarketsStaticData, selectedChainConfig]);

  const chainOptions = useMemo(() => SOURCE_CHAINS.map(toChainOption), []);

  const assetSelectDisabled = !assetOptions.length;

  // If the selected product is not in the asset options, reset it
  if (
    selectedProductId != null &&
    !assetOptions.some((option) => option.productId === selectedProductId)
  ) {
    setSelectedProductId(undefined);
  }

  const isPrimaryChain = selectedChainId === primaryChainId;
  const hasDDA = !!directDepositAddress;

  const depositOptions = useMemo<DepositOptionCardButtonProps[]>(() => {
    const hasSelectedRoute =
      selectedProductId != null && selectedChainId != null;

    // Cross-chain deposits require a DDA as the bridge destination address
    const needsDDA = !isPrimaryChain && !hasDDA;

    return [
      {
        title: t(($) => $.depositFromConnectedWallet),
        description: t(($) => $.depositFundsFromConnectedWallet),
        disabled: !hasSelectedRoute || needsDDA,
        imageSrc: connectedWalletImg,
        onClick: () => {
          if (selectedChainId == null) {
            return;
          }

          if (isPrimaryChain) {
            push({
              type: 'wallet_deposit',
              params: { initialProductId: selectedProductId },
            });
            return;
          }

          if (!directDepositAddress) {
            return;
          }

          if (
            selectedProductId === KNOWN_PRODUCT_IDS.usdc &&
            selectedChainId in CCTP_SOURCE_CHAIN_CONFIGS
          ) {
            push({
              type: 'cctp_bridge',
              params: {
                initialProductId: selectedProductId,
                directDepositAddress,
                selectedChainId: selectedChainId as CctpSourceChainId,
              },
            });
            return;
          }

          if (
            selectedProductId === QUOTE_PRODUCT_ID &&
            selectedChainId in USDT0_SOURCE_CHAIN_CONFIGS
          ) {
            push({
              type: 'usdt0_bridge',
              params: {
                initialProductId: selectedProductId,
                directDepositAddress,
                selectedChainId: selectedChainId as Usdt0SourceChainId,
              },
            });
            return;
          }

          // No dedicated bridge — cross-chain deposit via LiFi
          push({
            type: 'lifi_widget',
            params: { directDepositAddress },
          });
        },
        dataTestId: 'deposit-options-dialog-deposit-from-connected-wallet',
      },
      {
        title: t(($) => $.depositFromExternalWallet),
        description: t(($) => $.transferAssetsFromOtherWalletsExchanges),
        disabled: !isPrimaryChain || !hasDDA || !hasSelectedRoute,
        imageSrc: externalWalletImg,
        onClick: () => {
          if (!directDepositAddress) return;

          push({
            type: 'dda_receive',
            params: {
              directDepositAddress,
              initialProductId: selectedProductId,
            },
          });
        },
        dataTestId: 'deposit-options-dialog-deposit-from-external-wallet',
      },
    ];
  }, [
    selectedProductId,
    selectedChainId,
    t,
    hasDDA,
    isPrimaryChain,
    directDepositAddress,
    push,
  ]);

  return {
    selectedProductId,
    selectedChainId,
    assetOptions,
    assetSelectDisabled,
    chainOptions,
    depositOptions,
    onProductSelected: setSelectedProductId,
    onChainSelected: setSelectedChainId,
  };
}

function toAssetOption(
  productId: number,
  metadata: SpotProductMetadata,
): DepositAssetOption {
  return {
    selectId: productId,
    productId,
    label: metadata.token.symbol,
    icon: metadata.token.icon.asset,
  };
}

function toChainOption(config: DepositSourceChainConfig): DepositChainOption {
  return {
    selectId: config.chain.id,
    chainId: config.chain.id,
    label: config.chain.name,
    icon: config.icon,
  };
}
