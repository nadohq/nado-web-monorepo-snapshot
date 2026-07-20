import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { MarketsCardContent } from 'client/pages/Markets/components/cards/MarketsCardContent';
import { MarketsCardItemButton } from 'client/pages/Markets/components/cards/MarketsCardItemButton';
import { useMarketsHotMarkets } from 'client/pages/Markets/components/cards/MarketsHotMarkets/useMarketsHotMarkets';
import { get } from 'lodash';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function MarketsHotMarkets() {
  const { t } = useTranslation();
  const { hotMarkets, isLoading } = useMarketsHotMarkets();
  const productIdLinks = useProductIdLinks();

  return (
    <MarketsCardContent
      isLoading={isLoading}
      title={t(($) => $.marketsPage.hotMarkets)}
      subtitle={t(($) => $.marketsPage.subtitle24hVolume)}
    >
      <div className="grid grid-cols-2 gap-2">
        {hotMarkets?.map(({ metadata, past24hDailyVolumeUsd, productId }) => {
          return (
            <MarketsCardItemButton
              key={metadata.marketName}
              href={get(productIdLinks, productId)}
              label={
                <>
                  <Image
                    src={metadata.icon.asset}
                    alt={metadata.marketName}
                    className="size-4"
                  />
                  {metadata.marketName}
                </>
              }
              value={past24hDailyVolumeUsd}
              numberFormatSpecifier={
                CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED
              }
            />
          );
        })}
      </div>
    </MarketsCardContent>
  );
}
