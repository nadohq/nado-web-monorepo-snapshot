import { useWindowSize } from '@nadohq/web-common';
import { useEventListener } from 'ahooks';
import type { SavedGridLayoutItem } from 'client/modules/localstorage/userState/types/tradingSettings';
import type { TradingGridItemConfig } from 'client/modules/trading/layout/consts';
import { useCallback, useRef, useState } from 'react';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { useContainerWidth } from 'react-grid-layout';

/**
 * Computes row height from a 40-row viewport baseline.
 *
 * Default trading grid configs intentionally span 43 rows (`max(y + h)` is currently 43)
 * so lower grid content can extend below the viewport.
 * Rounding to the nearest 10px limits RGL remounts.
 */
function computeRowHeight(windowHeight: number): number {
  return Math.round(Math.max(windowHeight, 600) / 40 / 10) * 10;
}

interface Params<TItemId extends string> {
  itemConfig: Record<TItemId, TradingGridItemConfig>;
  savedLayout: Record<TItemId, SavedGridLayoutItem>;
  setSavedLayout: (newLayout: Record<TItemId, SavedGridLayoutItem>) => void;
}

function getIsFullscreen() {
  return typeof document !== 'undefined' && !!document.fullscreenElement;
}

/**
 * Manages grid layout state, container width measurement, and row height for a trading grid layout variant.
 * @param params - Trading grid layout inputs.
 * @returns Container ref + layout + interaction handlers for react-grid-layout.
 */
export function useTradingGridLayout<TItemId extends string>({
  itemConfig,
  savedLayout,
  setSavedLayout,
}: Params<TItemId>) {
  // measureBeforeMount: true avoids SSR hydration mismatch
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });

  // rowHeight reacts to viewport height changes; 10px rounding limits RGL remounts (via key prop).
  const { height: windowHeight } = useWindowSize();
  const computedRowHeight = computeRowHeight(windowHeight);

  // Freeze rowHeight while any element is fullscreen.
  //
  // Why: TradingView's chart has a built-in fullscreen button that calls the
  // browser Fullscreen API. Entering fullscreen changes window.innerHeight and remounts
  // RGL and every child (including TradingViewChart), tearing down the
  // datafeed/widget and kicking the user back out of fullscreen.
  //
  // The exit transition is the tricky part: `fullscreenchange` fires before
  // useWindowSize's ResizeObserver catches up, so flipping the flag
  // immediately would leave one render with (isFullscreen=false,
  // height=fullscreenHeight) and let a stale snapshot through. We absorb
  // that lag by *delaying* the false transition — the same flag covers
  // both "in fullscreen" and "settling after exit."
  const [isFullscreen, setIsFullscreen] = useState(() => getIsFullscreen());
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEventListener('fullscreenchange', () => {
    if (exitTimeoutRef.current) {
      exitTimeoutRef.current = null;
    }
    if (getIsFullscreen()) {
      setIsFullscreen(true);
    } else {
      exitTimeoutRef.current = setTimeout(() => {
        setIsFullscreen(false);
        exitTimeoutRef.current = null;
      }, 250);
    }
  });

  const [stableRowHeight, setStableRowHeight] = useState(computedRowHeight);
  if (!isFullscreen && stableRowHeight !== computedRowHeight) {
    setStableRowHeight(computedRowHeight);
  }

  // Merges saved x/y/w/h onto item config to preserve minW/minH constraints.
  const layout: LayoutItem[] = (
    Object.entries(itemConfig) as [TItemId, TradingGridItemConfig][]
  ).map(([id, config]) => ({
    ...config,
    i: id,
    ...savedLayout[id],
  }));

  // Persist layout only on drag/resize stop
  const onInteractionStop = useCallback(
    (newLayout: Layout) => {
      setSavedLayout(
        Object.fromEntries(
          newLayout.map(({ i, x, y, w, h }) => [i, { x, y, w, h }]),
        ) as Record<TItemId, SavedGridLayoutItem>,
      );
    },
    [setSavedLayout],
  );

  return {
    containerRef,
    mounted,
    width,
    rowHeight: stableRowHeight,
    layout,
    onDragStop: onInteractionStop,
    onResizeStop: onInteractionStop,
  };
}
