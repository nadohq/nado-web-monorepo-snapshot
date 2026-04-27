import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import {
  joinClassNames,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import { Pill, Select, useSelect } from '@nadohq/web-ui';
import { CollateralSpotProductSelectValue } from 'client/modules/collateral/types';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface AssetSelectProps extends WithClassnames {
  availableProducts: CollateralSpotProductSelectValue[];
  selectedProduct: CollateralSpotProductSelectValue | undefined;
  assetAmountTitle?: string;
  disabled?: boolean;
  optionsClassName?: string;
  onProductSelected: (productId: number) => void;
}

export function CollateralAssetSelect({
  className,
  optionsClassName,
  selectedProduct,
  availableProducts,
  assetAmountTitle,
  disabled,
  onProductSelected,
}: AssetSelectProps) {
  const disableSelect = !availableProducts.length || disabled;

  const options = useMemo(
    () =>
      availableProducts.map((product) => ({
        label: product.symbol,
        value: product,
      })),
    [availableProducts],
  );

  const onSelectedValueChange = useCallback(
    (product: CollateralSpotProductSelectValue) =>
      onProductSelected(product.productId),
    [onProductSelected],
  );

  const {
    selectOptions,
    selectedOption,
    open,
    onValueChange,
    value,
    onOpenChange,
  } = useSelect({
    selectedValue: selectedProduct,
    onSelectedValueChange,
    options,
  });

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
        noDisabledOverlay
        borderRadiusVariant="xs"
        className={joinClassNames('flex bg-transparent', className)}
        disabled={disableSelect}
      >
        <SelectedAsset selectedProduct={selectedOption?.value} />
      </Select.Trigger>
      <Select.Options
        className={mergeClassNames(
          // Non-standard width set to match the width of entire input container when possible,
          // custom breakpoint used for smaller mobile devices as sm: is too big
          'w-[350px] [@media(max-width:400px)]:w-[315px]',
          'flex flex-col px-2 pb-0.5',
          optionsClassName,
        )}
        header={<AssetSelectHeader assetAmountTitle={assetAmountTitle} />}
        viewportClassName="flex max-h-44 flex-col gap-y-1 py-1.5"
      >
        {selectOptions.map(({ value: optionValue, original: product }) => {
          return (
            <AssetSelectOption
              key={optionValue}
              value={optionValue}
              product={product}
            />
          );
        })}
      </Select.Options>
    </Select.Root>
  );
}

function AssetSelectHeader({
  assetAmountTitle,
}: {
  assetAmountTitle?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="text-text-tertiary flex w-full items-center justify-between px-2 pt-2 pb-1 text-xs">
      <span>{t(($) => $.chooseAsset)}</span>
      <span className="empty:hidden">{assetAmountTitle}</span>
    </div>
  );
}

function AssetSelectOption({
  product,
  value,
}: {
  value: string;
  product: CollateralSpotProductSelectValue;
}) {
  const { t } = useTranslation();

  return (
    <Select.Option
      value={value}
      className="flex items-center justify-between px-3 py-1"
      withSelectedCheckmark={false}
    >
      <div className="flex flex-1 items-center gap-x-2">
        <Image
          src={product.icon.asset}
          alt={t(($) => $.imageAltText.assetIcon)}
          height={20}
          width={20}
          className="inline"
        />
        <span>{product.symbol}</span>
        {product.depositAPY && (
          <Pill sizeVariant="xs" colorVariant="positive">
            {t(($) => $.apyValue, {
              apy: formatNumber(product.depositAPY, {
                formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
              }),
            })}
          </Pill>
        )}
      </div>
      <div className="flex flex-col items-end gap-y-1.5">
        <span className="w-max">
          {formatNumber(product?.displayedAssetAmount, {
            formatSpecifier: CustomNumberFormatSpecifier.NUMBER_AUTO,
          })}
        </span>
        <span className="text-text-tertiary text-2xs w-max">
          {formatNumber(product?.displayedAssetValueUsd, {
            formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
          })}
        </span>
      </div>
    </Select.Option>
  );
}

function SelectedAsset({
  selectedProduct,
}: {
  selectedProduct?: CollateralSpotProductSelectValue;
}) {
  const { t } = useTranslation();

  if (!selectedProduct) {
    return (
      <p className="text-text-tertiary px-2">
        {t(($) => $.inputPlaceholders.select)}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-x-1.5">
      <Image
        src={selectedProduct?.icon.asset ?? ''}
        alt={t(($) => $.imageAltText.assetIcon)}
        height={18}
        width={18}
      />
      <span className="text-text-primary">{selectedProduct?.symbol}</span>
    </div>
  );
}
