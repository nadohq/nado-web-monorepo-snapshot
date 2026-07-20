import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { Button, Icons } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useShouldFlash } from 'client/hooks/ui/useShouldFlash';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import { clamp, range } from 'lodash';
import { memo } from 'react';

const CONTAINER_PADDING_CLASSNAMES = 'px-3 py-1.5';

interface ContainerProps extends WithClassnames, WithChildren {
  onClick: () => void;
  highlightWidthFraction: BigNumber;
  isSell: boolean;
  flashKey?: string;
  flashOnMount?: boolean;
  definitionId?: DefinitionTooltipID;
  enableAnimations: boolean;
  // Highlights rows in the center-to-hover sweep range.
  isInHoveredRange?: boolean;
  // Draws the sweep boundary on the hovered row.
  showHoverBoundary?: boolean;
}

function Container({
  children,
  className,
  onClick,
  highlightWidthFraction,
  isSell,
  flashKey,
  flashOnMount,
  definitionId,
  enableAnimations,
  isInHoveredRange,
  showHoverBoundary,
}: WithChildren<ContainerProps>) {
  const shouldFlash = useShouldFlash({
    flashKey,
    flashOnMount,
  });

  const flashClassName = (() => {
    if (!shouldFlash || !enableAnimations) {
      return;
    }

    return isSell ? 'bg-negative/20' : 'bg-positive/20';
  })();
  const rowHoverClassName = isSell
    ? 'hover:bg-negative/20'
    : 'hover:bg-positive/20';
  const highlightWidthPercentage = clamp(
    highlightWidthFraction.times(100).toNumber(),
    0,
    100,
  );

  return (
    <DefinitionTooltip
      definitionId={definitionId}
      decoration="none"
      noHelpCursor
      asChild
    >
      <Button
        onClick={onClick}
        className={mergeClassNames(
          'group relative isolate flex gap-x-1 transition-colors duration-150',
          'text-text-secondary text-xs tabular-nums',
          rowHoverClassName,
          flashClassName,
          CONTAINER_PADDING_CLASSNAMES,
          className,
        )}
      >
        {/* Overlay instead of row bg, which is already used by the flash
            animations. Kept behind row content and depth bars via -z-10. */}
        {isInHoveredRange && (
          <div className="bg-overlay-hover absolute inset-0 -z-10" />
        )}
        <div
          className={joinClassNames(
            'absolute inset-0 border-l',
            isSell
              ? 'bg-negative/20 border-negative'
              : 'bg-positive/20 border-positive',
          )}
          style={{
            width: `${highlightWidthPercentage.toFixed()}%`,
          }}
        />
        {children}
        {showHoverBoundary && (
          <div
            className={joinClassNames(
              'border-text-tertiary absolute right-0 left-0 border-dashed',
              // Asks render with reverseRows, so the boundary visually faces away from the center price on each side.
              isSell ? 'top-0 border-t' : 'bottom-0 border-b',
            )}
          />
        )}
      </Button>
    </DefinitionTooltip>
  );
}

function Item({
  children,
  className,
  isSell,
}: WithChildren<
  WithClassnames<{
    // If provided, will render green/red based on the side
    isSell?: boolean;
  }>
>) {
  const textColorClassName = (() => {
    if (isSell == null) {
      return;
    }
    return isSell ? 'text-negative' : 'text-positive';
  })();

  return (
    <div
      className={mergeClassNames(
        'flex flex-1 justify-start',
        textColorClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}

const Skeleton = ({
  className,
  numCols,
}: WithClassnames<{ numCols: number }>) => (
  <div
    className={mergeClassNames(
      'flex flex-1',
      CONTAINER_PADDING_CLASSNAMES,
      className,
    )}
  >
    {range(numCols).map((_, index) => (
      <Item key={index} className="text-text-primary animate-pulse text-xs">
        <Icons.Minus />
      </Item>
    ))}
  </div>
);

export const MarketOrderRow = {
  Container,
  Item,
  Skeleton: memo(Skeleton),
};
