import {
  CustomNumberFormatSpecifier,
  NumberFormatSpecifier,
  safeDiv,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { BaseDefinitionTooltip, Divider } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useTranslation } from 'react-i18next';

interface Props extends WithChildren {
  cumulativeBaseAmount: BigNumber;
  cumulativeQuoteAmount: BigNumber;
  baseSymbol: string | undefined;
  quoteSymbol: string | undefined;
  priceFormatSpecifier: NumberFormatSpecifier;
  amountFormatSpecifier: NumberFormatSpecifier;
  hasOpenOrder: boolean | undefined;
  enableHoverDetails?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function OrderbookHoverTooltip({
  children,
  cumulativeBaseAmount,
  cumulativeQuoteAmount,
  baseSymbol,
  quoteSymbol,
  priceFormatSpecifier,
  amountFormatSpecifier,
  hasOpenOrder,
  enableHoverDetails,
  onHoverStart,
  onHoverEnd,
}: Props) {
  const { t } = useTranslation();

  if (!enableHoverDetails) {
    return children;
  }

  const avgPrice = safeDiv(cumulativeQuoteAmount, cumulativeBaseAmount);

  return (
    <BaseDefinitionTooltip
      title={null}
      content={
        <div
          data-testid="orderbook-hover-tooltip"
          className="flex flex-col gap-y-2"
        >
          <div className="flex flex-col gap-y-1">
            <ValueWithLabel.Horizontal
              sizeVariant="xs"
              label={t(($) => $.avgPrice)}
              value={avgPrice}
              numberFormatSpecifier={priceFormatSpecifier}
            />
            <ValueWithLabel.Horizontal
              sizeVariant="xs"
              label={t(($) => $.totalSymbol, { symbol: baseSymbol ?? '' })}
              value={cumulativeBaseAmount}
              numberFormatSpecifier={amountFormatSpecifier}
            />
            <ValueWithLabel.Horizontal
              sizeVariant="xs"
              label={t(($) => $.totalSymbol, { symbol: quoteSymbol ?? '' })}
              value={cumulativeQuoteAmount}
              numberFormatSpecifier={
                CustomNumberFormatSpecifier.NUMBER_LARGE_ABBREVIATED
              }
            />
          </div>
          {hasOpenOrder && (
            <>
              <Divider />
              <span className="text-text-secondary">
                {t(($) => $.orderbookOpenOrderMessage)}
              </span>
            </>
          )}
        </div>
      }
      tooltipContentContainerClassName="min-w-[186px]"
      tooltipOptions={{
        placement: 'left',
        delayShow: 0,
        delayHide: 0,
        interactive: false,
        offset: [0, 8],
      }}
      // Rows have a 2px flex gap (gap-y-0.5) between them that belongs to no row, so a pointer in the
      // gap is over neither row and the tooltip/overlay flicker between rows. py-px extends
      // the hit area 1px top and bottom to bridge the gap; -my-px keeps the visual gap unchanged.
      contentWrapperClassName="flex py-px -my-px"
      noHelpCursor
      asChild
    >
      <div onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
        {children}
      </div>
    </BaseDefinitionTooltip>
  );
}
