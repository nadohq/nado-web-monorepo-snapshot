import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import {
  Divider,
  formatDurationMillis,
  Icons,
  TextButton,
  TimeFormatSpecifier,
} from '@nadohq/web-ui';
import { MarketInfoCard } from 'client/components/MarketInfoCard';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarketInfoCardsContainer } from 'client/modules/trading/components/MarketInfoCardsContainer';
import { FundingRatesTooltip } from 'client/pages/PerpTrading/components/PerpMarketInfoCards/FundingRatesTooltip';
import { MarketStatusInfoCard } from 'client/pages/PerpTrading/components/PerpMarketInfoCards/MarketStatusInfoCard';
import { usePerpMarketInfoCards } from 'client/pages/PerpTrading/hooks/usePerpMarketInfoCards';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

export function PerpMarketInfoCards({ className }: WithClassnames) {
  const { t } = useTranslation();

  const { show } = useDialog();
  const { productId, millisToNextFunding, perpMarketInfo } =
    usePerpMarketInfoCards();

  const fundingRate1Yr = perpMarketInfo?.fundingRates?.['1y'];
  const fundingRate1Hr = perpMarketInfo?.fundingRates?.['1h'];

  return (
    <MarketInfoCardsContainer className={className}>
      <MarketInfoCard
        definitionTooltipId="lastPrice"
        valueClassName={joinClassNames(
          'flex text-base font-medium',
          getSignDependentColorClassName(perpMarketInfo?.latestPriceChange),
        )}
        value={formatNumber(perpMarketInfo?.marketPrice, {
          formatSpecifier: perpMarketInfo?.priceFormatSpecifier,
        })}
        flashOnChangeKey={perpMarketInfo?.marketPrice}
        dataTestId="perp-market-info-last-price"
      />
      <Divider vertical className="h-4.5" />
      <MarketInfoCard
        label={t(($) => $.oraclePrice)}
        definitionTooltipId="oraclePrice"
        value={formatNumber(perpMarketInfo?.oraclePrice, {
          formatSpecifier: perpMarketInfo?.priceFormatSpecifier,
        })}
        flashOnChangeKey={perpMarketInfo?.oraclePrice}
        dataTestId="perp-market-info-oracle-price"
      />
      <MarketInfoCard
        label={t(($) => $.indexPrice)}
        definitionTooltipId="perpUnderlyingSpotIndexPrice"
        value={formatNumber(perpMarketInfo?.indexPrice, {
          formatSpecifier: perpMarketInfo?.priceFormatSpecifier,
        })}
        flashOnChangeKey={perpMarketInfo?.indexPrice}
        dataTestId="perp-market-info-index-price"
      />
      <MarketStatusInfoCard productId={productId} />
      <MarketInfoCard
        label={t(($) => $.change24h)}
        flashOnChangeKey={perpMarketInfo?.priceChangeFrac24h}
        dataTestId="perp-market-info-24h-change"
        value={
          <div
            className={joinClassNames(
              'flex gap-x-1',
              getSignDependentColorClassName(
                perpMarketInfo?.priceChangeFrac24h,
              ),
            )}
          >
            <span>
              {formatNumber(perpMarketInfo?.priceChange24h, {
                formatSpecifier: perpMarketInfo?.signedPriceFormatSpecifier,
              })}
            </span>
            <span>
              (
              {formatNumber(perpMarketInfo?.priceChangeFrac24h, {
                formatSpecifier:
                  PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
              })}
              )
            </span>
          </div>
        }
      />
      <MarketInfoCard
        label={t(($) => $.volume24h)}
        definitionTooltipId="24hVolume"
        value={formatNumber(perpMarketInfo?.quoteVolume24h, {
          formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
        })}
        flashOnChangeKey={perpMarketInfo?.quoteVolume24h}
        dataTestId="perp-market-info-24h-volume"
      />
      <MarketInfoCard
        label={t(($) => $.openInterest)}
        definitionTooltipId="perpOpenInterest"
        value={formatNumber(perpMarketInfo?.openInterestQuote, {
          formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
        })}
        flashOnChangeKey={perpMarketInfo?.openInterestQuote}
        dataTestId="perp-market-info-open-interest"
      />
      <MarketInfoCard
        label={t(($) => $.estimatedAbbrevFunding1h)}
        definitionTooltipId="funding1h"
        flashOnChangeKey={fundingRate1Hr}
        value={
          <div className="flex items-center gap-x-1">
            <div className={getSignDependentColorClassName(fundingRate1Hr)}>
              {formatNumber(fundingRate1Hr, {
                formatSpecifier:
                  PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP,
              })}
            </div>
            <FundingRatesTooltip fundingRates={perpMarketInfo?.fundingRates} />
          </div>
        }
        dataTestId="perp-market-info-est-funding-1h"
      />
      <MarketInfoCard
        label={t(($) => $.countdown)}
        definitionTooltipId="countdownToNextFunding"
        value={formatDurationMillis(millisToNextFunding, {
          formatSpecifier: TimeFormatSpecifier.MM_SS,
        })}
        dataTestId="perp-market-info-countdown"
      />
      <MarketInfoCard
        label={t(($) => $.estimatedAbbrevAnnualAbbrevFunding)}
        definitionTooltipId="perpAnnualizedFunding"
        value={
          <div className={getSignDependentColorClassName(fundingRate1Yr)}>
            {formatNumber(fundingRate1Yr, {
              formatSpecifier:
                PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
            })}
          </div>
        }
        flashOnChangeKey={fundingRate1Yr}
        dataTestId="perp-market-info-est-ann-funding"
      />

      {/* Market details entrypoint is pushed to the very right for large screens */}
      <TextButton
        colorVariant="secondary"
        className="ml-auto px-2 text-xs"
        startIcon={<Icons.Info />}
        onClick={() => {
          if (!productId) {
            return;
          }
          show({
            type: 'market_details',
            params: {
              productId,
            },
          });
        }}
      >
        {t(($) => $.buttons.marketDetails)}
      </TextButton>
    </MarketInfoCardsContainer>
  );
}
