import { ProductEngineType } from '@nadohq/client';
import {
  formatNumber,
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import {
  OrderFormValues,
  RoundAmountFn,
} from 'client/modules/trading/types/orderFormTypes';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useCallback } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  currentMarket: StaticMarketData | undefined;
  amount: BigNumber | undefined;
  initialMarginBoundedUsd: BigNumber | undefined;
  form: UseFormReturn<OrderFormValues>;
  inputConversionPrice: BigNumber | undefined;
  roundAssetAmount: RoundAmountFn;
}

export function OrderPlacementAccountInfoDisplay({
  form,
  currentMarket,
  amount,
  inputConversionPrice,
  initialMarginBoundedUsd,
  roundAssetAmount,
}: Props) {
  const { t } = useTranslation();

  const isPerp = currentMarket?.type === ProductEngineType.PERP;

  const sizeDenom = useWatch({
    control: form.control,
    name: 'sizeDenom',
  });

  const onPositionAmountClick = useCallback(() => {
    if (!amount || !inputConversionPrice) {
      return;
    }

    // We round amount and abs to size for input usage
    const roundedSize = roundAssetAmount(amount).abs();

    const newSizeInput =
      sizeDenom === 'quote'
        ? roundedSize.multipliedBy(inputConversionPrice)
        : roundedSize;

    form.setValue('sizeSource', 'size');
    form.setValue('size', newSizeInput.toString());
  }, [form, sizeDenom, amount, inputConversionPrice, roundAssetAmount]);

  return (
    <div className="flex flex-col gap-y-3">
      <ValueWithLabel.Horizontal
        label={t(($) => $.availableMargin)}
        sizeVariant="xs"
        value={initialMarginBoundedUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
        dataTestId="order-placement-available-margin"
      />
      <ValueWithLabel.Horizontal
        label={isPerp ? t(($) => $.position) : t(($) => $.balance)}
        sizeVariant="xs"
        valueContent={
          <TextButton
            colorVariant="primary"
            className={getSignDependentColorClassName(amount)}
            onClick={onPositionAmountClick}
            dataTestId="order-placement-position-amount"
          >
            {formatNumber(amount, {
              formatSpecifier: getMarketSizeFormatSpecifier({
                sizeIncrement: currentMarket?.sizeIncrement,
              }),
            })}{' '}
            {isPerp
              ? currentMarket?.metadata.symbol
              : currentMarket?.metadata.token.symbol}
          </TextButton>
        }
      />
    </div>
  );
}
