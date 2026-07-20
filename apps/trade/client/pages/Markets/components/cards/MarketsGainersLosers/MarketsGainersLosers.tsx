import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { NextImageSrc } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { MarketsCardContent } from 'client/pages/Markets/components/cards/MarketsCardContent';
import { MarketsCardItemButton } from 'client/pages/Markets/components/cards/MarketsCardItemButton';
import { useMarketsGainersLosers } from 'client/pages/Markets/components/cards/MarketsGainersLosers/useMarketsGainersLosers';
import { get } from 'lodash';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function MarketsGainersLosers() {
  const { t } = useTranslation();
  const { gainers, losers, isLoading } = useMarketsGainersLosers();
  const productIdLinks = useProductIdLinks();

  return (
    <MarketsCardContent
      title={t(($) => $.marketsPage.gainersAndLosers)}
      subtitle={t(($) => $.marketsPage.subtitle24hChange)}
      isLoading={isLoading}
    >
      {/* Column-flow grid: gainers fill the left column top-to-bottom, losers the right. */}
      <div className="grid grid-flow-col grid-cols-2 grid-rows-3 gap-2">
        {[...gainers, ...losers].map(
          ({ metadata, pastDayPriceChangeFrac, productId }) => (
            <Item
              key={productId}
              href={get(productIdLinks, productId)}
              iconSrc={metadata.icon.asset}
              marketName={metadata.marketName}
              pastDayPriceChangeFrac={pastDayPriceChangeFrac}
            />
          ),
        )}
      </div>
    </MarketsCardContent>
  );
}

interface ItemProps {
  marketName: string;
  iconSrc: NextImageSrc;
  pastDayPriceChangeFrac: BigNumber;
  href: string | undefined;
}

function Item({
  marketName,
  iconSrc,
  pastDayPriceChangeFrac,
  href,
}: ItemProps) {
  return (
    <MarketsCardItemButton
      href={href}
      label={
        <>
          <Image src={iconSrc} alt={marketName} className="size-4" />
          {marketName}
        </>
      }
      value={pastDayPriceChangeFrac}
      valueClassName={
        pastDayPriceChangeFrac.isNegative() ? 'text-negative' : 'text-positive'
      }
      numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP}
    />
  );
}
