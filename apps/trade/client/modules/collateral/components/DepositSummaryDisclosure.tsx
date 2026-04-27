import { SubaccountTx } from '@nadohq/client';
import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { ActionSummary } from 'client/components/ActionSummary';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { DepositInfoCardType } from 'client/modules/collateral/deposit/types';
import { useCollateralEstimateSubaccountInfoChange } from 'client/modules/collateral/hooks/useCollateralEstimateSubaccountInfoChange';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  estimateStateTxs: SubaccountTx[];
  displayedInfoCardType?: DepositInfoCardType;
  productId: number | undefined;
  isHighlighted: boolean | undefined;
  symbol: string | undefined;
}

export function DepositSummaryDisclosure({
  className,
  estimateStateTxs,
  productId,
  isHighlighted,
  symbol,
}: Props) {
  const { t } = useTranslation();
  const { current: currentState, estimated: estimatedState } =
    useCollateralEstimateSubaccountInfoChange({
      productId,
      estimateStateTxs,
    });

  const metricItems = useMemo(
    () =>
      [
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
      ] satisfies ValueWithLabelProps[],
    [currentState, estimatedState, symbol, t],
  );

  const content = (
    <>
      {metricItems.map(
        (
          { numberFormatSpecifier, label, value, newValue, valueEndElement },
          index,
        ) => (
          <ValueWithLabel.Horizontal
            key={index}
            sizeVariant="xs"
            label={label}
            value={value}
            newValue={newValue}
            numberFormatSpecifier={numberFormatSpecifier}
            valueEndElement={valueEndElement}
            changeArrowClassName="text-positive"
          />
        ),
      )}
    </>
  );

  return (
    <ActionSummary.Disclosure
      className={className}
      expandableContent={content}
      labelContent={t(($) => $.summary)}
      isHighlighted={isHighlighted}
    />
  );
}
