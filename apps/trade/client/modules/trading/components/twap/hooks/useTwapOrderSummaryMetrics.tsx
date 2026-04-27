import { sumBigNumberBy } from '@nadohq/client';
import {
  formatNumber,
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { formatDurationMillis, TimeFormatSpecifier } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { TWAP_RANDOMNESS_FRACTION } from 'client/modules/trading/components/twap/consts';
import {
  calcTwapNumberOfOrders,
  calcTwapSuborderAssetAmount,
  calculateTwapRuntimeInMillis,
  getTwapOrderAmounts,
} from 'client/modules/trading/components/twap/utils';
import {
  OrderFormValues,
  RoundAmountFn,
} from 'client/modules/trading/types/orderFormTypes';
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Params {
  form: UseFormReturn<OrderFormValues>;
  sizeIncrement: BigNumber | undefined;
  baseSymbol: string | undefined;
  validAssetAmount: BigNumber | undefined;
  roundAssetAmount: RoundAmountFn;
}

export function useTwapOrderSummaryMetrics({
  form,
  sizeIncrement,
  baseSymbol,
  validAssetAmount,
  roundAssetAmount,
}: Params) {
  const { t } = useTranslation();

  const [
    orderType,
    isRandomOrder,
    twapDurationHoursInput,
    twapDurationMinutesInput,
    twapFrequencyInSeconds,
  ] = useWatch({
    control: form.control,
    name: [
      'orderType',
      'twapOrder.isRandomOrder',
      'twapOrder.durationHours',
      'twapOrder.durationMinutes',
      'twapOrder.frequencyInSeconds',
    ],
  });
  return useMemo((): ValueWithLabelProps[] => {
    if (orderType !== 'twap') {
      return [];
    }

    const numberOfOrders = calcTwapNumberOfOrders(
      {
        hours: twapDurationHoursInput,
        minutes: twapDurationMinutesInput,
      },
      twapFrequencyInSeconds,
    );

    const assetAmountPerSuborder = calcTwapSuborderAssetAmount({
      orderAssetAmount: validAssetAmount,
      numberOfOrders,
      roundAssetAmount,
    });

    const amounts = validAssetAmount
      ? getTwapOrderAmounts({
          numberOfOrders,
          orderAssetAmount: validAssetAmount,
          roundAssetAmount,
          randomnessFraction: isRandomOrder ? TWAP_RANDOMNESS_FRACTION : 0,
          sizeIncrement,
        })
      : undefined;

    const totalAmount = sumBigNumberBy(amounts, (amt) => amt);

    const runtimeInMillis = calculateTwapRuntimeInMillis(
      twapFrequencyInSeconds,
      numberOfOrders,
    );

    return [
      {
        label: t(($) => $.totalSize),
        value: totalAmount,
        numberFormatSpecifier: getMarketSizeFormatSpecifier({ sizeIncrement }),
        tooltip: { id: 'tradingOrderTwapTotalSize' },
        valueEndElement: baseSymbol,
      },
      {
        label: t(($) => $.runtime),
        valueContent: formatDurationMillis(runtimeInMillis, {
          formatSpecifier: TimeFormatSpecifier.HH_MM_SS,
        }),
      },
      {
        label: t(($) => $.numberOfOrders),
        value: numberOfOrders,
        numberFormatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
      },
      {
        label: t(($) => $.sizePerSuborder),
        valueContent: (
          <>
            {isRandomOrder ? '≈' : ''}
            {formatNumber(assetAmountPerSuborder, {
              formatSpecifier: getMarketSizeFormatSpecifier({
                sizeIncrement,
              }),
            })}
          </>
        ),
        valueEndElement: baseSymbol,
      },
    ];
  }, [
    orderType,
    twapDurationHoursInput,
    twapDurationMinutesInput,
    twapFrequencyInSeconds,
    validAssetAmount,
    roundAssetAmount,
    isRandomOrder,
    sizeIncrement,
    baseSymbol,
    t,
  ]);
}
