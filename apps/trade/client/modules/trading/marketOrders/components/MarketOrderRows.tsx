import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { ScrollShadowsContainer } from '@nadohq/web-ui';
import { range } from 'lodash';
import { Fragment, Key, ReactNode } from 'react';

interface Props<TRow> extends WithClassnames {
  rows: TRow[] | undefined;
  numRows: number;
  renderRow: (row: TRow) => ReactNode;
  skeletonRow: ReactNode;
  reverseRows?: boolean;
  /** Optional key function for rows. When omitted, index-based keys are used, which preserves DOM nodes by position. */
  getRowKey?: (row: TRow, index: number) => Key;
}

export function MarketOrderRows<TRow>({
  rows,
  numRows,
  skeletonRow,
  renderRow,
  className,
  reverseRows,
  getRowKey,
}: Props<TRow>) {
  const content = (() => {
    if (!rows?.length) {
      return range(numRows).map((_, index) => (
        <Fragment key={index}>{skeletonRow}</Fragment>
      ));
    }

    // Index-based keys prevent orderbook scroll jumps by keeping DOM nodes pinned to their position.
    // Row components must reset their own state when data changes (e.g. flash animations) or provide a custom getRowKey.
    return rows.slice(0, numRows).map((row, index) => {
      return (
        <Fragment key={getRowKey?.(row, index) ?? index}>
          {renderRow(row)}
        </Fragment>
      );
    });
  })();

  return (
    <ScrollShadowsContainer
      className={mergeClassNames(
        'flex gap-y-0.5',
        reverseRows ? 'flex-col-reverse' : 'flex-col',
        className,
      )}
      isReversed={reverseRows}
      shadowSize={15}
    >
      {content}
    </ScrollShadowsContainer>
  );
}
