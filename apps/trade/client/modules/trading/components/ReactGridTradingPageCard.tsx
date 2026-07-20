import { joinClassNames } from '@nadohq/web-common';
import type { HTMLAttributes, Ref } from 'react';

import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { TradingPageCard } from 'client/modules/trading/components/TradingPageCard';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Ref passed by react-grid-layout so it can attach handlers/styles to this element. */
  ref?: Ref<HTMLDivElement>;
  /** Overrides the drag handle height/behavior. Defaults to `h-2`; tablet layouts use `h-3`. */
  dragHandleClassName?: string;
}

/** Wraps TradingPageCard for use as an RGL grid item, providing a top-edge drag handle. */
export function ReactGridTradingPageCard({
  children,
  className,
  style,
  ref,
  dragHandleClassName,
  ...rglProps
}: Props) {
  const isConnected = useIsConnected();

  return (
    <div {...rglProps} ref={ref} style={style} className={className}>
      <TradingPageCard
        // h-full is an internal requirement. RGL sizes the grid item, the card must fill it.
        // overflow-y-auto keeps overflowing card content scrollable within the grid item.
        className="relative h-full overflow-y-auto"
      >
        {/* Drag handle: only the top edge of the card initiates drag.
            The CSS selector '.trading-drag-handle' is passed to ReactGridLayout's
            dragConfig.handle - clicks outside this area will not drag the card. */}
        <div
          className={joinClassNames(
            'trading-drag-handle absolute top-0 z-10 w-full',
            dragHandleClassName ?? 'h-2',
            isConnected
              ? 'cursor-grab active:cursor-grabbing'
              : 'cursor-default',
          )}
        />
        {children}
      </TradingPageCard>
    </div>
  );
}
