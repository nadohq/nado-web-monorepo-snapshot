import { BigNumber } from 'bignumber.js';
import { QuoteAmount } from 'client/modules/tables/components/QuoteAmount';
import { StackedValues } from 'client/modules/tables/components/StackedValues';
import { useTranslation } from 'react-i18next';

interface Props {
  filledQuoteSize: BigNumber | undefined;
  totalQuoteSize: BigNumber;
  isPrimaryQuote: boolean;
  quoteSymbol: string;
  isMarket: boolean;
  isCloseEntirePosition: boolean;
}

export function OrderFilledQuoteValue({
  filledQuoteSize,
  totalQuoteSize,
  isPrimaryQuote,
  quoteSymbol,
  isMarket,
  isCloseEntirePosition,
}: Props) {
  const { t } = useTranslation();

  const top = (
    <QuoteAmount
      quoteAmount={filledQuoteSize}
      isPrimaryQuote={isPrimaryQuote}
      quoteSymbol={quoteSymbol}
    />
  );

  const bottom = (() => {
    if (isMarket) {
      return t(($) => $.market);
    }

    if (isCloseEntirePosition) {
      return t(($) => $.entirePosition);
    }

    return (
      <QuoteAmount
        quoteAmount={totalQuoteSize}
        isPrimaryQuote={isPrimaryQuote}
        quoteSymbol={quoteSymbol}
      />
    );
  })();

  return <StackedValues withSeparator top={top} bottom={bottom} />;
}
