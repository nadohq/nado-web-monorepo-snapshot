import { joinClassNames } from '@nadohq/web-common';

import { TradingGridResizeHandle } from 'client/modules/trading/layout/TradingGridResizeHandle';
import type { ReactNode, Ref } from 'react';
import type { Layout, LayoutItem } from 'react-grid-layout';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

interface Props {
  children: ReactNode;
  containerRef: Ref<HTMLDivElement>;
  mounted: boolean;
  width: number;
  rowHeight: number;
  layout: LayoutItem[];
  isEnabled: boolean;
  onDragStop: (newLayout: Layout) => void;
  onResizeStop: (newLayout: Layout) => void;
}

export function TradingGridLayoutContainer({
  children,
  containerRef,
  mounted,
  width,
  rowHeight,
  layout,
  isEnabled,
  onDragStop,
  onResizeStop,
}: Props) {
  return (
    // RGL manages its own height. Rendered after mount to avoid SSR hydration mismatch.
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          // The key forces a remount when rowHeight changes because RGL caches pixel measurements per instance.
          key={`rgl-${rowHeight}`}
          width={width}
          layout={layout}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          gridConfig={{
            cols: 24,
            rowHeight,
            margin: [4, 4],
            containerPadding: [0, 0],
          }}
          dragConfig={{
            enabled: isEnabled,
            // Only the top edge of each card initiates drag.
            handle: '.trading-drag-handle',
          }}
          resizeConfig={{
            enabled: isEnabled,
            // Only resize from the bottom-right corner.
            handles: ['se'],
            handleComponent: (_axis, ref) => (
              <TradingGridResizeHandle
                ref={ref as Ref<HTMLDivElement>}
                isEnabled={isEnabled}
                className={joinClassNames(
                  'absolute right-0 bottom-0 h-5 w-5',
                  isEnabled ? 'cursor-se-resize' : 'pointer-events-none',
                )}
              />
            ),
          }}
        >
          {children}
        </ReactGridLayout>
      )}
    </div>
  );
}
