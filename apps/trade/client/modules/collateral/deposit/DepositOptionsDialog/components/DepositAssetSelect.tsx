import { DepositSelect } from 'client/modules/collateral/deposit/DepositOptionsDialog/components/DepositSelect';
import { DepositAssetOption } from 'client/modules/collateral/deposit/DepositOptionsDialog/types';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedProductId: number | undefined;
  disabled: boolean;
  assetOptions: DepositAssetOption[];
  onProductSelected: (productId: number) => void;
}

export function DepositAssetSelect({
  selectedProductId,
  disabled,
  assetOptions,
  onProductSelected,
}: Props) {
  const { t } = useTranslation();

  const selectedValue = useMemo(
    () => assetOptions.find((option) => option.productId === selectedProductId),
    [assetOptions, selectedProductId],
  );

  const onSelectedValueChange = useCallback(
    (option: DepositAssetOption) => onProductSelected(option.productId),
    [onProductSelected],
  );

  return (
    <DepositSelect
      selectedValue={selectedValue}
      options={assetOptions}
      disabled={disabled}
      placeholder={t(($) => $.inputPlaceholders.selectAsset)}
      altText={t(($) => $.imageAltText.assetIcon)}
      onSelectedValueChange={onSelectedValueChange}
      dataTestId="deposit-options-dialog-deposit-asset-select"
    />
  );
}
