import { DepositSelect } from 'client/modules/collateral/deposit/DepositOptionsDialog/components/DepositSelect';
import { DepositChainOption } from 'client/modules/collateral/deposit/DepositOptionsDialog/types';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedChainId: number | undefined;
  chainOptions: DepositChainOption[];
  onChainSelected: (chainId: number) => void;
}

export function DepositChainSelect({
  selectedChainId,
  chainOptions,
  onChainSelected,
}: Props) {
  const { t } = useTranslation();

  const selectedValue = useMemo(
    () => chainOptions.find((option) => option.chainId === selectedChainId),
    [chainOptions, selectedChainId],
  );

  const onSelectedValueChange = useCallback(
    (option: DepositChainOption) => onChainSelected(option.chainId),
    [onChainSelected],
  );

  return (
    <DepositSelect
      selectedValue={selectedValue}
      options={chainOptions}
      placeholder={t(($) => $.inputPlaceholders.selectChain)}
      altText={t(($) => $.imageAltText.chainIcon)}
      onSelectedValueChange={onSelectedValueChange}
      dataTestId="deposit-options-dialog-deposit-chain-select"
    />
  );
}
