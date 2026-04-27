import { BaseTestProps, mergeClassNames } from '@nadohq/web-common';
import { ReactNode } from 'react';
import { IconBaseProps, Icons } from '../Icons';
import { Tooltip, TooltipProps } from './Tooltip';

export type BaseDefinitionTooltipDecoration =
  | 'underline'
  | { icon: true | IconBaseProps }
  | 'none';

export interface BaseDefinitionTooltipProps
  extends BaseTestProps, Omit<TooltipProps, 'tooltipContent' | 'endIcon'> {
  title: ReactNode;
  content: ReactNode;
  /** Additional classnames to apply to the tooltip content container */
  tooltipContentContainerClassName?: string;
  /** Additional decorations, such as an underline or info icon, to apply to the tooltip*/
  decoration?: BaseDefinitionTooltipDecoration;
}

// Tooltip with standard title & description content
export function BaseDefinitionTooltip({
  title,
  content,
  contentWrapperClassName,
  tooltipContentContainerClassName,
  tooltipOptions,
  decoration,
  children,
  dataTestId,
  ...rest
}: BaseDefinitionTooltipProps) {
  const hasIcon = typeof decoration !== 'string' && !!decoration?.icon;
  const icon = (() => {
    if (!hasIcon) {
      return null;
    }

    const iconProps: IconBaseProps =
      decoration.icon === true ? {} : decoration.icon;
    const { size, className } = iconProps;

    return (
      <Icons.Info
        size={size ?? 16}
        className={mergeClassNames('text-text-tertiary', className)}
        {...iconProps}
      />
    );
  })();

  const underlineClassNames = (() => {
    if (decoration !== 'underline') {
      return '';
    }

    return mergeClassNames(
      'underline underline-offset-[3px]',
      'decoration-dashed decoration-disabled',
      'transition-colors',
      contentWrapperClassName,
    );
  })();

  const tooltipContent = (
    <div
      className={mergeClassNames(
        'flex max-w-[270px] flex-col gap-y-1 overflow-hidden p-2 text-left',
        tooltipContentContainerClassName,
      )}
    >
      {title && <div className="text-text-primary text-sm">{title}</div>}
      <div className="text-text-secondary flex flex-col gap-y-2 text-xs whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );

  return (
    <Tooltip
      contentWrapperClassName={mergeClassNames(
        icon && 'flex gap-x-1 items-center w-max',
        contentWrapperClassName,
        underlineClassNames,
      )}
      tooltipContent={tooltipContent}
      tooltipOptions={{
        placement: 'auto-start',
        ...tooltipOptions,
      }}
      endIcon={icon}
      dataTestId={dataTestId}
      {...rest}
    >
      {children}
    </Tooltip>
  );
}
