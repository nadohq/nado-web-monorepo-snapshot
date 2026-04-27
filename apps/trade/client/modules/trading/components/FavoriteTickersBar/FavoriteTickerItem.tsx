import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { TextButton } from '@nadohq/web-ui';
import { FavoriteTicker } from 'client/modules/trading/components/FavoriteTickersBar/types';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import Link from 'next/link';

interface Props {
  ticker: FavoriteTicker;
}

export function FavoriteTickerItem({ ticker }: Props) {
  return (
    <TextButton
      className="flex items-center gap-1.5 text-xs"
      colorVariant={ticker.isActive ? 'primary' : 'tertiary'}
      href={ticker.href}
      as={Link}
    >
      <span>{ticker.marketName}</span>

      <span className={getSignDependentColorClassName(ticker.priceChangeFrac)}>
        {formatNumber(ticker.priceChangeFrac, {
          formatSpecifier: PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
        })}
      </span>

      <span>
        {formatNumber(ticker.currentPrice, {
          formatSpecifier: getMarketPriceFormatSpecifier(ticker.priceIncrement),
        })}
      </span>
    </TextButton>
  );
}
