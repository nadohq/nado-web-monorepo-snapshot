import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Divider, SecondaryButton } from '@nadohq/web-ui';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useQuerySubaccountFeeRates } from 'client/hooks/query/subaccount/useQuerySubaccountFeeRates';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { TradingPageCard } from 'client/modules/trading/components/TradingPageCard';
import { formatLeverage } from 'client/utils/formatLeverage';
import { getRiskClassNames } from 'client/utils/getRiskClassNames';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function AccountHeader() {
  const { t } = useTranslation();

  const { show } = useDialog();
  const isConnected = useIsConnected();

  const handleDeposit = () => {
    show({
      type: 'deposit_options',
      params: {},
    });
  };

  const handleWithdraw = () => {
    show({
      type: 'withdraw',
      params: {},
    });
  };

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-text-primary text-sm font-medium">
        {t(($) => $.account)}
      </h3>
      <div className="flex gap-x-2">
        <SecondaryButton
          size="xs"
          onClick={handleDeposit}
          disabled={!isConnected}
          dataTestId="account-deposit-button"
        >
          {t(($) => $.buttons.deposit)}
        </SecondaryButton>
        <SecondaryButton
          size="xs"
          onClick={handleWithdraw}
          disabled={!isConnected}
          dataTestId="account-withdraw-button"
        >
          {t(($) => $.buttons.withdraw)}
        </SecondaryButton>
      </div>
    </div>
  );
}

interface Props extends WithClassnames {
  productId: number | undefined;
}

export function AccountInfoCard({ className, productId }: Props) {
  const { t } = useTranslation();

  const { data: subaccountOverview } = useSubaccountOverview();
  const { data: subaccountFeeRates } = useQuerySubaccountFeeRates();

  const feeRates = useMemo(() => {
    if (!productId) {
      return undefined;
    }

    return {
      maker: subaccountFeeRates?.orders[productId]?.maker,
      taker: subaccountFeeRates?.orders[productId]?.taker,
    };
  }, [subaccountFeeRates, productId]);

  const accountRiskMetrics: ValueWithLabelProps[] = useMemo(() => {
    return [
      {
        label: t(($) => $.availableMargin),
        value: subaccountOverview?.initialMarginBoundedUsd,
        numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
        tooltip: { id: 'availableMarginUsd' },
      },
      {
        label: t(($) => $.maintMarginUsage),
        value: subaccountOverview?.maintMarginUsageFractionBounded,
        numberFormatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
        valueClassName: getRiskClassNames(
          subaccountOverview?.maintMarginUsageFractionBounded,
        ).text,
        tooltip: { id: 'maintMarginRatio' },
      },
      {
        label: t(($) => $.accountLeverage),
        valueContent: formatLeverage(subaccountOverview?.accountLeverage),
        tooltip: { id: 'accountLeverage' },
      },
    ];
  }, [subaccountOverview, t]);

  const accountValueMetrics: ValueWithLabelProps[] = useMemo(() => {
    return [
      {
        label: t(($) => $.totalEquity),
        value: subaccountOverview?.portfolioValueUsd,
        numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
      },
      {
        label: t(($) => $.unrealizedPerpPnl),
        value: subaccountOverview?.perp.totalUnrealizedPnlUsd,
        numberFormatSpecifier: PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
        valueClassName: getSignDependentColorClassName(
          subaccountOverview?.perp.totalUnrealizedPnlUsd,
        ),
      },
      {
        label: t(($) => $.unrealizedSpotPnl),
        value: subaccountOverview?.spot.totalUnrealizedPnlUsd,
        numberFormatSpecifier: PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
        valueClassName: getSignDependentColorClassName(
          subaccountOverview?.spot.totalUnrealizedPnlUsd,
        ),
      },
      {
        label: t(($) => $.feeTier),
        valueContent: (
          <div className="flex items-center gap-x-0.5">
            <DefinitionTooltip
              definitionId="feeTier"
              decoration={{ icon: { size: 14 } }}
              tooltipOptions={{ interactive: true, delayHide: 300 }}
            />
            {formatNumber(feeRates?.maker, {
              formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP,
            })}
            {' / '}
            {formatNumber(feeRates?.taker, {
              formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP,
            })}
          </div>
        ),
      },
    ];
  }, [subaccountOverview, feeRates, t]);

  return (
    <TradingPageCard
      className={joinClassNames('flex flex-col gap-y-5 p-3', className)}
    >
      <AccountHeader />
      <div className="flex flex-col gap-y-3">
        {accountRiskMetrics.map((itemProps, index) => (
          <ValueWithLabel.Horizontal
            key={index}
            sizeVariant="xs"
            {...itemProps}
          />
        ))}
        <Divider />
        {accountValueMetrics.map((itemProps, index) => (
          <ValueWithLabel.Horizontal
            key={index}
            sizeVariant="xs"
            {...itemProps}
          />
        ))}
      </div>
    </TradingPageCard>
  );
}
