import {
  AnnotatedSpotMarket,
  formatNumber,
  getMarketPriceFormatSpecifier,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { WithClassnames, joinClassNames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { useTranslation } from 'react-i18next';

interface Props {
  market: AnnotatedSpotMarket | undefined;
  repayConversionPrice: BigNumber | undefined;
}

export function RepayConversionRateDisplay({
  className,
  market,
  repayConversionPrice,
}: WithClassnames<Props>) {
  const { t } = useTranslation();
  const { primaryQuoteToken } = useNadoMetadataContext();

  if (!market || !repayConversionPrice) {
    return null;
  }

  const formattedConversionPrice = formatNumber(repayConversionPrice, {
    formatSpecifier: getMarketPriceFormatSpecifier(market.priceIncrement),
  });

  return (
    <div
      className={joinClassNames(
        'text-2xs text-text-secondary flex items-center gap-x-1.5',
        className,
      )}
    >
      <DefinitionTooltip
        definitionId="repayConvertEstimatedPrice"
        decoration={{ icon: { size: 14 } }}
      />
      {t(($) => $.estimatedConversionPrice, {
        tokenSymbol: market.metadata.token.symbol,
        formattedConversionPrice,
        quoteTokenSymbol: primaryQuoteToken.symbol,
      })}
    </div>
  );
}
