import { QUOTE_PRODUCT_ID } from '@nadohq/client';
import { useNadoMetadataContext } from '@nadohq/react-client';
import { PrimaryButton } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DirectDepositAddressDisplay } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/components/DirectDepositAddressDisplay';
import { DirectDepositConfirmationCheckbox } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/components/DirectDepositConfirmationCheckbox';
import { DirectDepositReceiveAssetSelect } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/components/DirectDepositReceiveAssetSelect';
import { DirectDepositReceiveInfoCard } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/components/DirectDepositReceiveInfoCard';
import { DirectDepositReceiveWarningPanel } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/components/DirectDepositReceiveWarningPanel';
import { getDirectDepositProductSymbol } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/getDirectDepositProductSymbol';
import { DirectDepositReceiveDialogParams } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/types';
import { useDepositFormData } from 'client/modules/collateral/deposit/hooks/useDepositFormData';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function DirectDepositReceiveDialog({
  directDepositAddress,
  initialProductId,
}: DirectDepositReceiveDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const {
    primaryChainEnvMetadata: { chainName, chainIcon },
  } = useNadoMetadataContext();

  const [showAddress, setShowAddress] = useState(false);
  const [productId, setProductId] = useState(
    initialProductId ?? QUOTE_PRODUCT_ID,
  );
  const [isWarningChecked, setIsWarningChecked] = useState(false);

  const { availableProducts, selectedProduct } = useDepositFormData({
    productIdInput: productId,
  });
  const selectedProductSymbol = selectedProduct
    ? getDirectDepositProductSymbol(t, selectedProduct)
    : undefined;

  const stateDependentContent = (() => {
    if (showAddress) {
      return (
        <>
          <DirectDepositAddressDisplay
            directDepositAddress={directDepositAddress}
          />
          <DirectDepositReceiveInfoCard
            chainName={chainName}
            chainIcon={chainIcon}
            minimumDepositAmount={
              selectedProduct?.decimalAdjustedMinimumInitialDepositAmount
            }
            selectedProductSymbol={selectedProductSymbol}
          />
          <PrimaryButton
            onClick={() => {
              setShowAddress(false);
            }}
          >
            {t(($) => $.buttons.done)}
          </PrimaryButton>
        </>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between">
          <span className="text-text-primary">
            {t(($) => $.assetToDeposit)}
          </span>
          <DirectDepositReceiveAssetSelect
            availableProducts={availableProducts}
            selectedProduct={selectedProduct}
            onProductSelect={setProductId}
          />
        </div>
        <DirectDepositReceiveInfoCard
          chainName={chainName}
          chainIcon={chainIcon}
          minimumDepositAmount={
            selectedProduct?.decimalAdjustedMinimumInitialDepositAmount
          }
          selectedProductSymbol={selectedProductSymbol}
        />
        <DirectDepositConfirmationCheckbox
          chainName={chainName}
          checked={isWarningChecked}
          onCheckedChange={setIsWarningChecked}
          selectedProductSymbol={selectedProductSymbol}
        />
        <PrimaryButton
          disabled={!isWarningChecked}
          onClick={() => {
            setShowAddress(true);
          }}
        >
          {t(($) => $.buttons.showAddressToSendFunds)}
        </PrimaryButton>
      </>
    );
  })();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.externalWalletDeposit)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <DirectDepositReceiveWarningPanel chainName={chainName} />
        {stateDependentContent}
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
