'use client';

import { QUOTE_PRODUCT_ID } from '@nadohq/client';
import { useNadoMetadataContext } from '@nadohq/react-client';
import { Card, PrimaryButton } from '@nadohq/web-ui';
import { useExecuteMintTokens } from 'client/hooks/execute/useExecuteMintTokens';
import { useQueryOnChainTransactionState } from 'client/hooks/query/useQueryOnChainTransactionState';
import { CollateralAssetSelect } from 'client/modules/collateral/components/CollateralAssetSelect';
import { useDepositFormData } from 'client/modules/collateral/deposit/hooks/useDepositFormData';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Faucet() {
  const { t } = useTranslation();

  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();

  const [selectedProductId, setSelectedProductId] =
    useState<number>(QUOTE_PRODUCT_ID);

  const { availableProducts, selectedProduct } = useDepositFormData({
    productIdInput: selectedProductId,
  });

  // Mint Mutation for EVM chains
  const executeMintTokens = useExecuteMintTokens();
  // Watch for tx status
  const mintTxState = useQueryOnChainTransactionState({
    txHash: executeMintTokens.data,
  });
  // Derive status text
  const mintStatusText = (() => {
    switch (mintTxState.type) {
      case 'idle':
        break;
      case 'pending':
        return t(($) => $.mintStatus.confirmingOnChain);
      case 'error':
        return t(($) => $.mintStatus.rejectedOnChain);
      case 'confirmed':
        return t(($) => $.mintStatus.confirmedOnChain);
    }

    switch (executeMintTokens.status) {
      case 'idle':
        break;
      case 'pending':
        return t(($) => $.mintStatus.submitting);
      case 'success':
        return t(($) => $.mintStatus.submitted);
      case 'error':
        return t(($) => $.mintStatus.transactionError);
    }

    return t(($) => $.mintStatus.idle);
  })();

  return (
    <Card className="flex flex-col gap-y-4 text-xs">
      <CollateralAssetSelect
        selectedProduct={availableProducts.find(
          (option) => option.productId === selectedProductId,
        )}
        availableProducts={availableProducts}
        assetAmountTitle={t(($) => $.inWallet)}
        onProductSelected={(productId: number) => {
          setSelectedProductId(productId);
        }}
        className="bg-surface-2 h-10 rounded-sm"
      />
      <div className="flex flex-col items-start gap-y-1.5">
        <p>
          {t(($) => $.obtainTestnetFundsWithLimits, {
            primaryQuoteTokenSymbol,
          })}
        </p>
        <p>
          <span className="text-text-primary label-separator font-medium">
            {t(($) => $.status)}
          </span>{' '}
          {mintStatusText}
        </p>
        <PrimaryButton
          className="w-full"
          isLoading={
            executeMintTokens.isPending || mintTxState.type === 'pending'
          }
          onClick={() => {
            if (!selectedProduct) {
              return;
            }
            executeMintTokens.mutate({
              productId: selectedProduct.productId,
              tokenDecimals: selectedProduct.tokenDecimals,
            });
          }}
        >
          {t(($) => $.buttons.mintTokens)}
        </PrimaryButton>
      </div>
    </Card>
  );
}
