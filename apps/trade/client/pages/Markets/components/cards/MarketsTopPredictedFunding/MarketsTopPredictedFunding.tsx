import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { MarketsCardContent } from 'client/pages/Markets/components/cards/MarketsCardContent';
import { MarketsCardItemButton } from 'client/pages/Markets/components/cards/MarketsCardItemButton';
import { useMarketsTopPredictedFunding } from 'client/pages/Markets/components/cards/MarketsTopPredictedFunding/useMarketsTopPredictedFunding';
import { get } from 'lodash';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function MarketsTopPredictedFunding() {
  const { t } = useTranslation();
  const { topPredictedFundingRates, isLoading } =
    useMarketsTopPredictedFunding();
  const productIdLinks = useProductIdLinks();

  return (
    <MarketsCardContent
      title={t(($) => $.marketsPage.topPredictedFunding)}
      subtitle={t(($) => $.marketsPage.annualized)}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-2 gap-2">
        {topPredictedFundingRates?.map(
          ({ metadata, annualizedFundingRate, productId }) => {
            return (
              <MarketsCardItemButton
                key={metadata.marketName}
                href={get(productIdLinks, productId)}
                label={
                  <>
                    <Image
                      src={metadata.icon.asset}
                      alt={metadata.symbol}
                      className="size-4"
                    />
                    {metadata.marketName}
                  </>
                }
                value={annualizedFundingRate}
                valueClassName={
                  annualizedFundingRate.isNegative()
                    ? 'text-negative'
                    : 'text-positive'
                }
                numberFormatSpecifier={
                  PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP
                }
              />
            );
          },
        )}
      </div>
    </MarketsCardContent>
  );
}
