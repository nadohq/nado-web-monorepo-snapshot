import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { Divider, ValueWithChange } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ActionSummary } from 'client/components/ActionSummary';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useIsolatedAdjustMarginSummary } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/useIsolatedAdjustMarginDialogSummary';
import { formatLeverage } from 'client/utils/formatLeverage';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isAddMargin: boolean;
  isoSubaccountName: string;
  validAmount: BigNumber | undefined;
  primaryQuoteTokenSymbol: string;
}

export function IsolatedAdjustMarginDialogSummaryDisclosure({
  isAddMargin,
  isoSubaccountName,
  validAmount,
  primaryQuoteTokenSymbol,
}: Props) {
  const { t } = useTranslation();

  return (
    <ActionSummary.Disclosure
      expandableContent={
        <Content
          validAmount={validAmount}
          isAddMargin={isAddMargin}
          isoSubaccountName={isoSubaccountName}
          primaryQuoteTokenSymbol={primaryQuoteTokenSymbol}
        />
      }
      isHighlighted={!!validAmount}
      labelContent={t(($) => $.summary)}
    />
  );
}

interface ContentProps {
  validAmount: BigNumber | undefined;
  isoSubaccountName: string;
  isAddMargin: boolean;
  primaryQuoteTokenSymbol: string;
}

function Content({
  validAmount,
  isAddMargin,
  isoSubaccountName,
  primaryQuoteTokenSymbol,
}: ContentProps) {
  const { t } = useTranslation();

  const {
    currentSummary,
    estimatedSummary,
    oraclePrice,
    metadata,
    side,
    marketPriceFormatSpecifier,
  } = useIsolatedAdjustMarginSummary({
    validAmount,
    isoSubaccountName,
    isAddMargin,
  });

  const positionItems = [
    {
      label: t(($) => $.positionMargin),
      value: currentSummary.isoNetMarginUsd,
      newValue: estimatedSummary?.isoNetMarginUsd,
      numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
    },
    {
      label: t(($) => $.positionLeverage),
      valueContent: (
        <ValueWithChange
          sizeVariant="xs"
          currentValue={formatLeverage(currentSummary.isoPositionLeverage)}
          newValue={
            estimatedSummary?.isoPositionLeverage
              ? formatLeverage(estimatedSummary?.isoPositionLeverage)
              : undefined
          }
        />
      ),
    },
    {
      label: t(($) => $.estimatedLiqPrice),
      value: currentSummary.isoLiquidationPrice,
      newValue: estimatedSummary?.isoLiquidationPrice,
      numberFormatSpecifier: marketPriceFormatSpecifier,
    },
    {
      label: t(($) => $.oraclePrice),
      value: oraclePrice,
      numberFormatSpecifier: marketPriceFormatSpecifier,
    },
  ] satisfies ValueWithLabelProps[];

  const accountItems = [
    {
      label: t(($) => $.symbolBalance, {
        symbol: primaryQuoteTokenSymbol,
      }),
      value: currentSummary.crossAccountQuoteBalance,
      newValue: estimatedSummary?.crossAccountQuoteBalance,
      numberFormatSpecifier: PresetNumberFormatSpecifier.NUMBER_2DP,
      valueEndElement: primaryQuoteTokenSymbol,
    },
    {
      label: t(($) => $.fundsAvailable),
      value: currentSummary.initialMargin,
      newValue: estimatedSummary?.initialMargin,
      numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
    },
    {
      label: t(($) => $.marginUsage),
      value: currentSummary.crossMarginUsageFrac,
      newValue: estimatedSummary?.crossMarginUsageFrac,
      numberFormatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
    },
  ] satisfies ValueWithLabelProps[];

  return (
    <>
      <Section
        headerContent={
          <div className="flex items-center gap-x-1 text-xs">
            {metadata?.marketName}
            <span
              className={joinClassNames(
                'uppercase',
                side === 'long' ? 'text-positive' : 'text-negative',
              )}
            >
              {side === 'long' ? t(($) => $.long) : t(($) => $.short)}
            </span>
          </div>
        }
        items={positionItems}
      />
      <Divider />
      <Section
        headerContent={
          <span className="text-xs">{t(($) => $.accountDetails)}</span>
        }
        items={accountItems}
      />
    </>
  );
}

interface SectionProps {
  items: ValueWithLabelProps[];
  headerContent: ReactNode;
}

function Section({ items, headerContent }: SectionProps) {
  return (
    <>
      {headerContent}
      <div className="flex flex-col gap-y-3">
        {items.map((item, index) => (
          <ValueWithLabel.Horizontal sizeVariant="xs" key={index} {...item} />
        ))}
      </div>
    </>
  );
}
