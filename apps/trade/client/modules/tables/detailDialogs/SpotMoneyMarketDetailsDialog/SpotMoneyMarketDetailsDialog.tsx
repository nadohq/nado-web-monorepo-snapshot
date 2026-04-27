import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { Divider } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { SignOfValuePill } from 'client/components/SignOfValuePill';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { HistoricalInterestRateChart } from 'client/modules/tables/detailDialogs/SpotMoneyMarketDetailsDialog/HistoricalInterestRateChart/HistoricalInterestRateChart';
import { useSpotMarketDetailsDialog } from 'client/modules/tables/detailDialogs/SpotMoneyMarketDetailsDialog/useSpotMarketDetailsDialog';
import { useTranslation } from 'react-i18next';

export interface SpotMoneyMarketDetailsDialogParams {
  productId: number;
}

export function SpotMoneyMarketDetailsDialog({
  productId,
}: SpotMoneyMarketDetailsDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const {
    tokenSymbol,
    initialMarginUsd,
    initialWeight,
    maintenanceMarginUsd,
    maintenanceWeight,
    totalSuppliedAmount,
    totalBorrowedAmount,
    utilizationFrac,
    availableLiquidityAmount,
  } = useSpotMarketDetailsDialog({ productId });

  const healthSectionContent = (
    <>
      <ValueWithLabel.Vertical
        label={t(($) => $.initialWeight)}
        value={initialWeight}
        numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
      />
      <ValueWithLabel.Vertical
        label={t(($) => $.initialMargin)}
        valueContent={<MarginValueContent marginUsd={initialMarginUsd} />}
      />
      <ValueWithLabel.Vertical
        label={t(($) => $.maintenanceWeightAbbrev)}
        value={maintenanceWeight}
        numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
      />
      <ValueWithLabel.Vertical
        label={t(($) => $.maintMarginAbbrev)}
        valueContent={<MarginValueContent marginUsd={maintenanceMarginUsd} />}
      />
    </>
  );

  const marketInfoSectionContent = (
    <>
      <ValueWithLabel.Vertical
        label={t(($) => $.totalSupplied)}
        value={totalSuppliedAmount}
        numberFormatSpecifier={
          CustomNumberFormatSpecifier.NUMBER_LARGE_ABBREVIATED
        }
        valueEndElement={tokenSymbol}
      />
      <ValueWithLabel.Vertical
        label={t(($) => $.totalBorrowed)}
        value={totalBorrowedAmount}
        numberFormatSpecifier={
          CustomNumberFormatSpecifier.NUMBER_LARGE_ABBREVIATED
        }
        valueEndElement={tokenSymbol}
      />
      <ValueWithLabel.Vertical
        label={t(($) => $.utilization)}
        value={utilizationFrac}
        numberFormatSpecifier={PresetNumberFormatSpecifier.PERCENTAGE_2DP}
      />
      <ValueWithLabel.Vertical
        label={t(($) => $.availableLiquidity)}
        value={availableLiquidityAmount}
        numberFormatSpecifier={
          CustomNumberFormatSpecifier.NUMBER_LARGE_ABBREVIATED
        }
        valueEndElement={tokenSymbol}
      />
    </>
  );

  return (
    <BaseAppDialog.Container className="sm:w-[648px]" onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>{tokenSymbol}</BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <SectionTitle>{t(($) => $.assetWeightsAndMargin)}</SectionTitle>
        <Section>{healthSectionContent}</Section>
        <Divider />
        <SectionTitle>{t(($) => $.marketInfo)}</SectionTitle>
        <Section>{marketInfoSectionContent}</Section>
        <Divider />
        <SectionTitle>{t(($) => $.historicalRates)}</SectionTitle>
        <HistoricalInterestRateChart productId={productId} />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}

function SectionTitle({ children }: WithChildren) {
  return <h2 className="text-text-primary text-sm">{children}</h2>;
}

function Section({ children }: WithChildren) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">{children}</div>
  );
}

function MarginValueContent({
  marginUsd,
}: {
  marginUsd: BigNumber | undefined;
}) {
  return (
    <div className="flex items-center gap-x-1">
      <SignOfValuePill value={marginUsd} />
      {formatNumber(marginUsd?.abs(), {
        formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
      })}
    </div>
  );
}
