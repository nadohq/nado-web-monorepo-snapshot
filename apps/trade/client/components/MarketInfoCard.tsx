import {
  BaseTestProps,
  WithClassnames,
  joinClassNames,
  mergeClassNames,
} from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useShouldFlash } from 'client/hooks/ui/useShouldFlash';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import { ReactNode } from 'react';
import { Config } from 'react-popper-tooltip';

interface MarketInfoCardProps extends BaseTestProps {
  label?: string;
  labelPostfix?: string;
  value: ReactNode;
  valueClassName?: string;
  definitionTooltipId?: DefinitionTooltipID;
  /** Optional key that, when provided, adds an overlay flash when `flashOnChangeKey` changes */
  flashOnChangeKey?: BigNumber;
}

export function MarketInfoCard({
  label,
  labelPostfix,
  value,
  definitionTooltipId,
  valueClassName,
  flashOnChangeKey,
  className,
  dataTestId,
}: WithClassnames<MarketInfoCardProps>) {
  const tooltipOptions: Partial<Config> = {
    placement: 'bottom',
  };

  const shouldFlash = useShouldFlash({
    flashKey: flashOnChangeKey?.toString(),
    flashDuration: 400,
  });

  const flashClassName = shouldFlash ? 'backdrop-brightness-200' : undefined;

  return (
    <div
      className={joinClassNames(
        'flex h-full min-w-max flex-col',
        'justify-center gap-y-0.5 px-2 py-0.5',
        'transition',
        // Using `cursor-default` to prevent the cursor from rapidly changing when hovering over different elements of the card.
        'cursor-default',
        // Applying a rounded-sm border to the container so that when the backdrop flashes, it isn't as rigid.
        'rounded-sm',
        flashClassName,
        className,
      )}
    >
      {label && (
        <DefinitionTooltip
          tooltipOptions={tooltipOptions}
          // Cards have a limited amount of vertical space, so use a lower offset for underline here
          contentWrapperClassName="underline-offset-2 text-3xs text-text-tertiary min-w-max leading-3"
          definitionId={definitionTooltipId}
        >
          {label}
          {labelPostfix && (
            // Purposefully use a space here instead of `gap`, otherwise the tooltip underline will not go underneath the gap
            <span> {labelPostfix}</span>
          )}
        </DefinitionTooltip>
      )}
      {/* Wrapping `value` with a tooltip if `label` doesn't exist and `tooltipId` is defined */}
      <DefinitionTooltip
        definitionId={!label ? definitionTooltipId : undefined}
        tooltipOptions={tooltipOptions}
        decoration="none"
        contentWrapperClassName={mergeClassNames(
          'text-text-primary min-w-max text-xs leading-4 tracking-wide',
          !value && 'animate-pulse',
          valueClassName,
        )}
        dataTestId={dataTestId}
      >
        {value}
      </DefinitionTooltip>
    </div>
  );
}
