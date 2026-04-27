import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { Icons, ScrollShadowsContainer, TextButton } from '@nadohq/web-ui';
import { FavoriteIcon } from 'client/components/Icons/FavoriteIcon';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { FavoriteTickerItem } from 'client/modules/trading/components/FavoriteTickersBar/FavoriteTickerItem';
import { useFavoriteTickers } from 'client/modules/trading/components/FavoriteTickersBar/hooks/useFavoriteTickers';
import { useTranslation } from 'react-i18next';

export function FavoriteTickersBar({
  className,
  activeProductId,
}: WithClassnames<{ activeProductId: number | undefined }>) {
  const { t } = useTranslation();

  const isConnected = useIsConnected();
  const { favoriteTickers, addDefaultFavorites } = useFavoriteTickers({
    activeProductId,
  });

  const favoriteMarketsContent = (() => {
    if (favoriteTickers.length > 0) {
      return (
        <ScrollShadowsContainer
          orientation="horizontal"
          className="flex h-full flex-1 gap-4 sm:gap-5"
        >
          {favoriteTickers.map((ticker) => (
            <FavoriteTickerItem ticker={ticker} key={ticker.productId} />
          ))}
        </ScrollShadowsContainer>
      );
    }
    return (
      <TextButton
        onClick={addDefaultFavorites}
        disabled={!isConnected}
        className="text-xs"
        endIcon={<Icons.Plus size={16} />}
        colorVariant="secondary"
      >
        {t(($) => $.buttons.addFavorites)}
      </TextButton>
    );
  })();

  return (
    <div className={mergeClassNames('flex h-8 items-center pr-3', className)}>
      <FavoriteIcon disabled isFavorited size={16} className="mx-3" />

      {favoriteMarketsContent}
    </div>
  );
}
