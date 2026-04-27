import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { Pill, Select, useSelect } from '@nadohq/web-ui';
import { getDirectDepositProductSymbol } from 'client/modules/collateral/deposit/DirectDepositReceiveDialog/getDirectDepositProductSymbol';
import { DepositProductSelectValue } from 'client/modules/collateral/deposit/types';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface DirectDepositReceiveAssetSelectProps {
  availableProducts: DepositProductSelectValue[];
  selectedProduct: DepositProductSelectValue | undefined;
  onProductSelect: (productId: number) => void;
}

export function DirectDepositReceiveAssetSelect({
  availableProducts,
  selectedProduct,
  onProductSelect,
}: DirectDepositReceiveAssetSelectProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () =>
      availableProducts.map((product) => ({
        label: product.symbol,
        value: product,
      })),
    [availableProducts],
  );

  const onSelectedValueChange = useCallback(
    (product: DepositProductSelectValue) => onProductSelect(product.productId),
    [onProductSelect],
  );

  const { selectOptions, open, onValueChange, value, onOpenChange } = useSelect(
    {
      selectedValue: selectedProduct,
      onSelectedValueChange,
      options,
    },
  );

  const disableSelect = !availableProducts.length;

  const triggerContent = (() => {
    if (!selectedProduct) {
      return t(($) => $.inputPlaceholders.select);
    }
    const symbol = getDirectDepositProductSymbol(t, selectedProduct);

    return (
      <div className="flex items-center gap-x-1.5">
        <Image
          src={selectedProduct.icon.asset}
          alt={symbol}
          className="size-5"
        />
        <span className="text-text-primary">{symbol}</span>
      </div>
    );
  })();

  return (
    <Select.Root
      open={open}
      onValueChange={onValueChange}
      value={value}
      onOpenChange={onOpenChange}
      disabled={disableSelect}
    >
      <Select.Trigger
        withChevron
        open={open}
        borderRadiusVariant="sm"
        disabled={disableSelect}
        className="py-1.5"
      >
        {triggerContent}
      </Select.Trigger>
      <Select.Options align="end">
        {selectOptions.map(({ value: optionValue, original: product }) => {
          const symbol = getDirectDepositProductSymbol(t, product);

          return (
            <Select.Option
              key={optionValue}
              value={optionValue}
              withSelectedCheckmark={false}
            >
              <div className="flex flex-1 items-center gap-x-2">
                <Image
                  src={product.icon.asset}
                  alt={symbol}
                  className="size-5"
                />
                <span>{symbol}</span>
                {product.depositAPY && (
                  <Pill
                    sizeVariant="xs"
                    colorVariant="positive"
                    className="ml-auto"
                  >
                    {t(($) => $.apyValue, {
                      apy: formatNumber(product.depositAPY, {
                        formatSpecifier:
                          PresetNumberFormatSpecifier.PERCENTAGE_2DP,
                      }),
                    })}
                  </Pill>
                )}
              </div>
            </Select.Option>
          );
        })}
      </Select.Options>
    </Select.Root>
  );
}
