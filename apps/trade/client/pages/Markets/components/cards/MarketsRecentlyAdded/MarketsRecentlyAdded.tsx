import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { MarketsCardContent } from 'client/pages/Markets/components/cards/MarketsCardContent';
import { MarketsCardItemButton } from 'client/pages/Markets/components/cards/MarketsCardItemButton';
import { useMarketsRecentlyAdded } from 'client/pages/Markets/components/cards/MarketsRecentlyAdded/useMarketsRecentlyAdded';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { get } from 'lodash';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function MarketsRecentlyAdded() {
  const { t } = useTranslation();
  const { recentlyAddedMarkets, isLoading } = useMarketsRecentlyAdded();
  const productIdLinks = useProductIdLinks();

  return (
    <MarketsCardContent
      title={t(($) => $.marketsPage.recentlyAdded)}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-2 gap-2">
        {recentlyAddedMarkets?.map(
          ({
            metadata,
            marketPriceChangeFrac,
            marketPrice,
            priceFormatSpecifier,
            productId,
          }) => {
            return (
              <MarketsCardItemButton
                key={productId}
                href={get(productIdLinks, productId)}
                label={
                  metadata && (
                    <>
                      <Image
                        src={metadata.icon.asset}
                        alt={metadata.marketName}
                        className="size-4"
                      />
                      {metadata.marketName}
                    </>
                  )
                }
                value={marketPrice}
                numberFormatSpecifier={priceFormatSpecifier}
                valueClassName="gap-x-2"
                valueEndElement={
                  <span
                    className={joinClassNames(
                      'text-2xs',
                      getSignDependentColorClassName(marketPriceChangeFrac),
                    )}
                  >
                    {formatNumber(marketPriceChangeFrac, {
                      formatSpecifier:
                        PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
                    })}
                  </span>
                }
              />
            );
          },
        )}
      </div>
    </MarketsCardContent>
  );
}
