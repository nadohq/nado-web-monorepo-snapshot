import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Divider, Icons, TextButton } from '@nadohq/web-ui';
import { MarketInfoCard } from 'client/components/MarketInfoCard';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarketInfoCardsContainer } from 'client/modules/trading/components/MarketInfoCardsContainer';
import { useSpotMarketInfoCards } from 'client/pages/SpotTrading/hooks/useSpotMarketInfoCards';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

export function SpotMarketInfoCards({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { show } = useDialog();
  const { productId, spotMarketInfo } = useSpotMarketInfoCards();

  return (
    <MarketInfoCardsContainer className={className}>
      <MarketInfoCard
        definitionTooltipId="lastPrice"
        dataTestId="spot-market-info-last-price"
        valueClassName={joinClassNames(
          'flex text-base',
          getSignDependentColorClassName(spotMarketInfo?.latestPriceChange),
        )}
        value={formatNumber(spotMarketInfo?.currentPrice, {
          formatSpecifier: spotMarketInfo?.priceFormatSpecifier,
        })}
        flashOnChangeKey={spotMarketInfo?.currentPrice}
      />
      <Divider vertical className="h-4.5" />
      <MarketInfoCard
        label={t(($) => $.change24h)}
        dataTestId="spot-market-info-24h-change"
        flashOnChangeKey={spotMarketInfo?.priceChangeFrac24h}
        value={
          <div
            className={joinClassNames(
              'flex gap-x-1',
              getSignDependentColorClassName(
                spotMarketInfo?.priceChangeFrac24h,
              ),
            )}
          >
            <span>
              {formatNumber(spotMarketInfo?.priceChange24h, {
                formatSpecifier: spotMarketInfo?.signedPriceFormatSpecifier,
              })}
            </span>
            <span>
              (
              {formatNumber(spotMarketInfo?.priceChangeFrac24h, {
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
        dataTestId="spot-market-info-24h-volume"
        definitionTooltipId="24hVolume"
        value={formatNumber(spotMarketInfo?.quoteVolume24h, {
          formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
        })}
        flashOnChangeKey={spotMarketInfo?.quoteVolume24h}
      />
      <MarketInfoCard
        label={t(($) => $.borrowRate)}
        dataTestId="spot-market-info-borrow-rate"
        definitionTooltipId="borrowAPY"
        value={formatNumber(spotMarketInfo?.borrowRate, {
          formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
        })}
        flashOnChangeKey={spotMarketInfo?.borrowRate}
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
