import { useNadoMetadataContext } from '@nadohq/react-client';
import { DiscList } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

export function PerpMarginModeIsolatedInfo() {
  const { t } = useTranslation();
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();

  return (
    <DiscList.Container>
      <DiscList.Item>{t(($) => $.marginIsolatedToPosition)}</DiscList.Item>
      <DiscList.Item>
        {t(($) => $.onlySymbolCanBeUsedAsMargin, { primaryQuoteTokenSymbol })}
      </DiscList.Item>
      <DiscList.Item>
        {t(($) => $.maxOneIsolatedPositionPerMarket)}
      </DiscList.Item>
    </DiscList.Container>
  );
}
