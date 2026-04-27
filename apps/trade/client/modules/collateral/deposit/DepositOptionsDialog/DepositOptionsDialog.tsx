import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DepositAssetSelect } from 'client/modules/collateral/deposit/DepositOptionsDialog/components/DepositAssetSelect';
import { DepositChainSelect } from 'client/modules/collateral/deposit/DepositOptionsDialog/components/DepositChainSelect';
import { DepositOptionCardButton } from 'client/modules/collateral/deposit/DepositOptionsDialog/components/DepositOptionCardButton';
import { DepositOptionsDialogParams } from 'client/modules/collateral/deposit/DepositOptionsDialog/types';
import { useDepositOptionsDialog } from 'client/modules/collateral/deposit/DepositOptionsDialog/useDepositOptionsDialog';
import { useTranslation } from 'react-i18next';

export function DepositOptionsDialog({
  initialProductId,
}: DepositOptionsDialogParams) {
  const { hide } = useDialog();
  const { t } = useTranslation();

  const {
    selectedProductId,
    selectedChainId,
    assetOptions,
    assetSelectDisabled,
    chainOptions,
    depositOptions,
    onProductSelected,
    onChainSelected,
  } = useDepositOptionsDialog({ initialProductId });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.deposit)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <div className="flex flex-col gap-y-2">
          <DepositChainSelect
            selectedChainId={selectedChainId}
            chainOptions={chainOptions}
            onChainSelected={onChainSelected}
          />
          <DepositAssetSelect
            disabled={assetSelectDisabled}
            selectedProductId={selectedProductId}
            assetOptions={assetOptions}
            onProductSelected={onProductSelected}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          {depositOptions.map(
            (
              { title, description, onClick, disabled, imageSrc, dataTestId },
              index,
            ) => (
              <DepositOptionCardButton
                key={index}
                title={title}
                description={description}
                onClick={onClick}
                imageSrc={imageSrc}
                disabled={disabled}
                dataTestId={dataTestId}
              />
            ),
          )}
        </div>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
