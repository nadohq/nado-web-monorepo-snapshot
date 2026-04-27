import { WithClassnames, joinClassNames } from '@nadohq/web-common';
import { DropdownUi, UpDownChevronIcon } from '@nadohq/web-ui';
import * as Popover from '@radix-ui/react-popover';
import { FavoriteIcon } from 'client/components/Icons/FavoriteIcon';
import { useFavoritedMarkets } from 'client/hooks/markets/useFavoritedMarkets';
import { ProductTypePill } from 'client/modules/trading/components/ProductTypePill';
import { MarketSwitcherItem } from 'client/modules/trading/components/TradingMarketSwitcher/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedMarket: MarketSwitcherItem | undefined;
  disableFavoriteButton: boolean;
  disabled: boolean;
  open: boolean;
}

export function TradingMarketSwitcherPopoverTrigger({
  className,
  selectedMarket,
  disableFavoriteButton,
  disabled,
  open,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const { toggleIsFavoritedMarket } = useFavoritedMarkets();
  const isFavorited = selectedMarket?.isFavorited ?? false;

  const marketContent = (() => {
    if (open || !selectedMarket) {
      return t(($) => $.chooseMarket);
    }

    return (
      <>
        <Image
          src={selectedMarket.market.icon.asset}
          alt={selectedMarket.market.symbol}
          className="h-6 w-auto"
        />
        {selectedMarket.market.marketName}
        <ProductTypePill productType={selectedMarket.market.productType} />
      </>
    );
  })();

  const favoriteButton = (() => {
    if (open) return null;
    if (!selectedMarket) return null;

    return (
      <FavoriteIcon
        isFavorited={isFavorited}
        disabled={disableFavoriteButton}
        size={20}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          if (!disableFavoriteButton) {
            toggleIsFavoritedMarket(selectedMarket.productId);
          }
        }}
      />
    );
  })();

  return (
    <Popover.Trigger asChild>
      <DropdownUi.Trigger
        borderRadiusVariant="none"
        className={joinClassNames(
          'p-3',
          // On desktop all four corners are rounded, while on mobile only the
          // top two are. To accommodate both styles, we apply `overflow-hidden`
          // here, which prevents the overlay's 0 border radius from overflowing
          // the rounded corners.
          'overflow-hidden',
          className,
        )}
        disabled={disabled}
        dataTestId="trading-market-switcher-trigger"
      >
        <div
          className="text-text-primary flex flex-1 items-center gap-x-2 text-base font-medium"
          data-testid="trading-market-switcher-trigger-market-content"
        >
          {marketContent}
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {favoriteButton}
          <UpDownChevronIcon size={20} open={open} />
        </div>
      </DropdownUi.Trigger>
    </Popover.Trigger>
  );
}
