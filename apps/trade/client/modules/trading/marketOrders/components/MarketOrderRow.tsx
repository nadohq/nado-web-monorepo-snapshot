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
          'group relative flex gap-x-1 transition-colors duration-150',
          'text-text-secondary text-xs tabular-nums',
          isSell ? 'hover:bg-negative/20' : 'hover:bg-positive/20',
          flashClassName,
          CONTAINER_PADDING_CLASSNAMES,
          className,
        )}
      >
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
