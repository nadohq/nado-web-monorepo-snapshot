import { SubaccountTx } from '@nadohq/client';
import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ActionSummary } from 'client/components/ActionSummary';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useCollateralEstimateSubaccountInfoChange } from 'client/modules/collateral/hooks/useCollateralEstimateSubaccountInfoChange';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  estimateStateTxs: SubaccountTx[];
  productId?: number;
  feeAmount: BigNumber | undefined;
  isHighlighted?: boolean;
  enableBorrows?: boolean;
  symbol?: string;
}

export function WithdrawSummaryDisclosure({
  className,
  estimateStateTxs,
  productId,
  isHighlighted,
  enableBorrows,
  feeAmount,
  symbol,
}: Props) {
  const { t } = useTranslation();
  const { current: currentState, estimated: estimatedState } =
    useCollateralEstimateSubaccountInfoChange({
      productId,
      estimateStateTxs,
    });

  const metricItems = useMemo(() => {
    const borrowingAmount = estimatedState?.borrowedAmount?.minus(
      currentState?.borrowedAmount ?? 0,
    );
    const borrowingAmountUsd = estimatedState?.borrowedValueUsd?.minus(
      currentState?.borrowedValueUsd ?? 0,
    );
    const items: ValueWithLabelProps[] = [
      {
        label: t(($) => $.balance),
        value: currentState?.nadoBalance,
        newValue: estimatedState?.nadoBalance,
        numberFormatSpecifier: CustomNumberFormatSpecifier.NUMBER_AUTO,
        valueEndElement: symbol,
      },
      {
        label: t(($) => $.accountValue),
        value: currentState?.accountValueUsd,
        newValue: estimatedState?.accountValueUsd,
        numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
      },
      {
        label: t(($) => $.marginUsage),
        value: currentState?.marginUsageBounded,
        newValue: estimatedState?.marginUsageBounded,
        numberFormatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
      },
      {
        label: t(($) => $.gasFee),
        tooltip: { id: 'gasFee' },
        value: feeAmount,
        numberFormatSpecifier: CustomNumberFormatSpecifier.NUMBER_PRECISE,
        valueEndElement: symbol,
      },
    ];
    if (enableBorrows) {
      items.unshift({
        label: t(($) => $.amountToBorrow),
        valueContent: (
          <>
            <span>
              {formatNumber(borrowingAmount, {
                formatSpecifier: CustomNumberFormatSpecifier.NUMBER_AUTO,
                defaultValue: 0,
              })}{' '}
              {symbol}
            </span>
            <span className="text-text-tertiary">
              (
              {formatNumber(borrowingAmountUsd, {
                formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
                defaultValue: 0,
              })}
              )
            </span>
          </>
        ),
      });
    }
    return items;
  }, [currentState, estimatedState, feeAmount, symbol, enableBorrows, t]);

  const content = metricItems.map((itemProps, index) => (
    <ValueWithLabel.Horizontal sizeVariant="xs" key={index} {...itemProps} />
  ));

  return (
    <ActionSummary.Disclosure
      className={className}
      expandableContent={content}
      labelContent={t(($) => $.summary)}
      isHighlighted={isHighlighted}
    />
  );
}
