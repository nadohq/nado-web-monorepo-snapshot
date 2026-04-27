import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  PresetNumberFormatSpecifier,
  signDependentValue,
} from '@nadohq/react-client';
import {
  joinClassNames,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import { getStateOverlayClassNames } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useLatestValueChange } from 'client/hooks/markets/useLatestValueChange';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { OrderbookSpreadData } from 'client/modules/trading/marketOrders/orderbook/hooks/types';
import { useTranslation } from 'react-i18next';

interface Props {
  lastPrice: BigNumber | undefined;
  priceIncrement: BigNumber | undefined;
  setPriceInput: (val: BigNumber) => void;
  spread: OrderbookSpreadData | undefined;
}

export function OrderbookPriceBox({
  lastPrice,
  priceIncrement,
  setPriceInput,
  spread,
  className,
}: WithClassnames<Props>) {
  const lastPriceChange = useLatestValueChange(lastPrice);

  const onPriceBoxClick = () => {
    if (lastPrice) {
      setPriceInput(lastPrice);
    }
  };

  const stateOverlayClassNames = getStateOverlayClassNames();

  return (
    <DefinitionTooltip definitionId="lastPrice" decoration="none">
      <div
        className={mergeClassNames(
          'flex cursor-pointer justify-between px-3 py-2.5',
          'text-text-primary text-xs',
          'border-stroke border-y',
          stateOverlayClassNames,
          className,
        )}
        onClick={onPriceBoxClick}
      >
        <div>
          {formatNumber(lastPrice, {
            formatSpecifier: getMarketPriceFormatSpecifier(priceIncrement),
          })}{' '}
          {signDependentValue(lastPriceChange, {
            positive: '↑',
            negative: '↓',
            zero: null,
          })}
        </div>
        {spread && (
          <Spread isHighSpread={spread.isHigh} spreadFrac={spread.frac} />
        )}
      </div>
    </DefinitionTooltip>
  );
}

function Spread({
  className,
  isHighSpread,
  spreadFrac,
}: WithClassnames<{
  isHighSpread: boolean | undefined;
  spreadFrac: BigNumber | undefined;
}>) {
  const { t } = useTranslation();

  return (
    <div
      className={joinClassNames(
        'text-text-tertiary text-2xs flex items-center gap-x-1',
        className,
      )}
    >
      <span className="label-separator">{t(($) => $.spread)}</span>
      <div className={isHighSpread ? 'text-negative' : 'text-text-secondary'}>
        {formatNumber(spreadFrac, {
          formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
        })}
      </div>
    </div>
  );
}
