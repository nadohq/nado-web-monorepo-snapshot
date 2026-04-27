import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
} from '@nadohq/web-common';
import { ReactNode } from 'react';
import { Icons } from '../Icons';
import { Tooltip, TooltipProps } from './Tooltip';

interface Props extends WithChildren<
  Pick<TooltipProps, 'asChild' | 'noHelpCursor' | 'tooltipOptions'>
> {
  label: ReactNode;
  tooltipContainerClassName?: string;
  contentWrapperClassName?: string;
  showInfoIcon?: boolean;
}

export function LabelTooltip({
  label,
  children,
  asChild,
  noHelpCursor,
  tooltipOptions,
  tooltipContainerClassName,
  contentWrapperClassName,
  showInfoIcon,
}: Props) {
  const icon = showInfoIcon ? (
    <Icons.Info className="text-text-tertiary" />
  ) : undefined;

  return (
    <Tooltip
      tooltipContent={label}
      hideArrow
      tooltipOptions={{ placement: 'bottom', ...tooltipOptions }}
      tooltipContainerClassName={joinClassNames(
        'max-w-72',
        'bg-surface-3 text-text-primary p-2 text-xs',
        tooltipContainerClassName,
      )}
      contentWrapperClassName={mergeClassNames(
        icon && 'flex gap-x-1 items-center',
        contentWrapperClassName,
      )}
      asChild={asChild}
      noHelpCursor={noHelpCursor}
      endIcon={icon}
    >
      {children}
    </Tooltip>
  );
}
